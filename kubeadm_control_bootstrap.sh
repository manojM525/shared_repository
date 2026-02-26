#!/usr/bin/env bash
# ---------------------------------------------------------
# Script: kubeadm-control-plane-bootstrap.sh
# Purpose: Bootstrap Kubernetes control plane using kubeadm
# OS     : Ubuntu (20.04 / 22.04)
# K8s    : v1.29.x
# Runtime: containerd
# ---------------------------------------------------------

set -euo pipefail

LOG_FILE="/var/log/kubeadm-bootstrap.log"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "===== Kubernetes Control Plane Bootstrap Started ====="
date

# ---------- Pre-flight checks ----------
if [[ $EUID -ne 0 ]]; then
  echo "ERROR: Run this script as root"
  exit 1
fi

echo "Hostname: $(hostname)"
echo "IP Addr : $(hostname -i)"

# ---------- Phase-1 Day-1 ----------

echo ">>> Disabling swap"

if swapon --summary | grep -q .; then
  swapoff -a
  sed -i '/ swap / s/^/#/' /etc/fstab
else
  echo "Swap already disabled"
fi

free -h | grep -i swap

# ---------- Kernel modules ----------
echo ">>> Loading kernel modules"

modprobe overlay
modprobe br_netfilter

cat <<EOF >/etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

lsmod | grep -E 'overlay|br_netfilter'

# ---------- Sysctl settings ----------
echo ">>> Applying sysctl parameters"

cat <<EOF >/etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

sysctl --system

sysctl net.bridge.bridge-nf-call-iptables
sysctl net.ipv4.ip_forward

# ---------- Containerd installation ----------
echo ">>> Installing containerd"

apt update
sudo apt install -y containerd=1.7.*
#Or better (Docker-maintained package):
#sudo apt install -y containerd.io
#This avoids containerd 2.x entirely.

mkdir -p /etc/containerd

if [[ ! -f /etc/containerd/config.toml ]]; then
  containerd config default > /etc/containerd/config.toml
fi

# Ensure SystemdCgroup is enabled
sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
#the above command is to be run only when containerd version is 1.xx

systemctl restart containerd
systemctl enable containerd

systemctl status containerd --no-pager

# ---------- crictl config ----------
cat <<EOF >/etc/crictl.yaml
runtime-endpoint: unix:///run/containerd/containerd.sock
image-endpoint: unix:///run/containerd/containerd.sock
timeout: 10
debug: false
EOF

# ---------- Phase-1 Day-2 ----------

echo ">>> Installing Kubernetes components"

apt install -y apt-transport-https ca-certificates curl gnupg

mkdir -p /etc/apt/keyrings

curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.29/deb/Release.key \
| gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

echo "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] \
https://pkgs.k8s.io/core:/stable:/v1.29/deb/ /" \
> /etc/apt/sources.list.d/kubernetes.list

apt update
apt install -y kubelet kubeadm kubectl
apt-mark hold kubelet kubeadm kubectl

kubeadm version
kubelet --version
kubectl version --client

# ---------- /etc/hosts ----------
HOST_IP=$(hostname -i | awk '{print $1}')
HOST_NAME=$(hostname)

grep -q "$HOST_NAME" /etc/hosts || \
echo "$HOST_IP $HOST_NAME" >> /etc/hosts

# ---------- kubeadm init ----------
echo ">>> Initializing Kubernetes control plane"

CONTROL_PLANE_IP="$HOST_IP"

kubeadm init \
  --kubernetes-version=v1.29.0 \
  --pod-network-cidr=192.168.0.0/16 \
  --apiserver-advertise-address="$CONTROL_PLANE_IP"

# ---------- kubeconfig ----------
echo ">>> Configuring kubectl access"

if [[ -n "${SUDO_USER:-}" ]]; then
  TARGET_USER="$SUDO_USER"
else
  TARGET_USER="root"
fi

USER_HOME=$(getent passwd "$TARGET_USER" | cut -d: -f6)

mkdir -p "$USER_HOME/.kube"
cp /etc/kubernetes/admin.conf "$USER_HOME/.kube/config"
chown "$TARGET_USER":"$TARGET_USER" "$USER_HOME/.kube/config"

date
