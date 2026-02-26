# phase-1 Day-1

swapon --summary  
//If output is empty → good;If not → disable it.

Disable swap immediately
sudo swapoff -a

//Disable swap permanently
sudo sed -i '/ swap / s/^/#/' /etc/fstab

Verify
free -h
//you should see:Swap: 0B

## Load required modules:

sudo modprobe overlay
sudo modprobe br_netfilter

// Persist them:

cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

Apply sysctl settings:

cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF


Apply immediately:

sudo sysctl --system

Verify
sysctl net.bridge.bridge-nf-call-iptables
sysctl net.ipv4.ip_forward


Both should return = 1

Install containerd:

sudo apt update
sudo apt install -y containerd

Generate default config:
mkdir -p /etc/containerd
sudo containerd config default | sudo tee /etc/containerd/config.toml

//Edit config:
sudo nano /etc/containerd/config.toml
Find:
SystemdCgroup = false
Change to:
SystemdCgroup = true  // no need of these commands if the containerd version is 2.0+ ; needed for v 1.00


sudo systemctl restart containerd
sudo systemctl enable containerd

tee /etc/crictl.yaml <<EOF
runtime-endpoint: unix:///run/containerd/containerd.sock
image-endpoint: unix:///run/containerd/containerd.sock
timeout: 10
debug: false
EOF


systemctl status containerd

lsmod | grep br_netfilter


## phase-1 Day-2

sudo apt update
sudo apt install -y apt-transport-https ca-certificates curl
sudo apt install -y gnupg

curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.29/deb/Release.key \
| sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

ls -l /etc/apt/keyrings/kubernetes-apt-keyring.gpg     // verify->You should see the file present.

echo "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.29/deb/ /" \
| sudo tee /etc/apt/sources.list.d/kubernetes.list

sudo cat /etc/apt/sources.list.d/kubernetes.list    // verify the list;
Expected output:
deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.29/

sudo apt update
sudo apt install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl


kubeadm version
kubelet --version
kubectl version --client




sudo bash -c 'echo "$(hostname -i) $(hostname)" >> /etc/hosts'




kubeadm init \
  --kubernetes-version=v1.29.0 \
  --pod-network-cidr=192.168.0.0/16 \
  --apiserver-advertise-address=<CONTROL_PLANE_IP>    -> use private IP

mkdir -p $HOME/.kube
cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
chown $(id -u):$(id -g) $HOME/.kube/config


kubectl get nodes
Expected output:
One node ;Status: NotReady

Static pod manifests
ls -l /etc/kubernetes/manifests/


You should see:

kube-apiserver.yaml

kube-controller-manager.yaml

kube-scheduler.yaml

etcd.yaml

👉 These files are the control plane.


Certificates
ls /etc/kubernetes/pki


You’ll see:

ca.crt

apiserver.crt

apiserver-kubelet-client.crt

etcd/

This is the trust backbone of the cluster.


Kubelet view
crictl ps


You should see containers for:

kube-apiserver

etcd

scheduler

controller-manager


## phase1- DAY-2

Once the static pods are running properly, we shall try to join worker nodes.

1️⃣ Theory: What does “joining a node” really mean?

When you run kubeadm join, you are not just “adding a VM”.

You are doing all of this:

1. kubelet on the worker:
   authenticates to the API server
   using a bootstrap token

2. The control plane:
     approves the node
     creates a Node object in etcd

3. Certificates are issued:
      kubelet client cert
      kubelet serving cert

4. kubelet starts reporting:
       heartbeats
       node status

The node becomes schedulable only after networking is ready

So “join” is:

identity + trust + registration + health reporting


WE HAVE TO GENERATE A TOKEN WHICH WE CAN USE ON WORKER NODES, SO THAT THEY CAN JOINT THE CLUSTER.

 kubeadm token create --print-join-command

execute this command in the control plane, we will get a output simillar to 

kubeadm join <control_plane_ip>:6443 \
  --token <token> \
  --discovery-token-ca-cert-hash sha256:<hash>


COPY the above OUTPUT and execute in the worker node which you wanted to join to the cluster.

Once you have joined the worker node to the cluster, you can check that by using:
 
  kubectl get nodes   #type it in the  control plane.

The status of nodes will be NotReady; since we haven't installed CNI till now.


A node is NotReady if:

   kubelet is not  running
   API server is not reachable
   container runtime is not  healthy
   CNI is not initialized.

This is important: Joining ≠ Ready


Before installing CNI plugin, we can check the health of CONTROL PLANE using:
   kubectl get componentstatuses
   kubectl get --raw='/readyz?verbose'  (on newer vesions)

You will get the output simillar to :
  scheduler: ok
  controller-manager: ok
  etcd: ok

  ## phase2 -kubernetes networking
    We shall use Calico CNI plugin in VXLAN mode;
      We are using:

        Calico VXLAN
        No BGP
        No cloud routing dependencies
      Why this matters practically:
        Works on GCP without extra setup
        Fewer moving parts
        Easier debugging while learning


   We’ll install Calico using the official manifest.
       Step 1: Download the Calico manifest On the control plane node:

    curl -O https://raw.githubusercontent.com/projectcalico/calico/v3.27.0/manifests/calico.yaml

    Version note:
    v3.27.x is stable and compatible with Kubernetes 1.29.

  Now, open the file : 
    vim calico.yaml   and search for :
     - name: CALICO_IPV4POOL_CIDR
       value: "<POD_CIDR_IP>"  

  make sure the the POD_CIDR_IP given by us during kubeadm init is taken as the value for CALICO_IPV4POOL_CIDR. If they are same, do nothing; If different , correct it;

  Now apply calico.yaml
    kubectl apply -f claico.yaml

    You should see resources being created:
      daemonsets
      deployments
      CRDs

Watch Calico pods come up using:

  kubectl get pods -n kube-system -w

You will see:
 calico-node-xxxxx (DaemonSet, one per node)
 calico-kube-controllers-xxxxx

Now the satus of the nodes will be changed from NotReady to Ready.


