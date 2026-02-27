import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

// Define interfaces directly in the file
interface Microgreen {
  microgreen_id: string;
  microgreen_name: string;
  image_url?: string;
  description?: string;
}

const RecipesPage: React.FC = () => {
  const [microgreens, setMicrogreens] = useState<Microgreen[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const fetchMicrogreens = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/public/microgreens`);
      if (!res.ok) throw new Error(`Failed to fetch microgreens: ${res.statusText}`);
      const data = await res.json();
      setMicrogreens(data.microgreens || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching microgreens:', error);
      setError((error as Error).message);
      setMicrogreens([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMicrogreens();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Microgreens</h2>

      {error && <p className="text-red-600 mb-6 text-sm font-medium">{error}</p>}

      {isLoading ? (
        <div className="flex justify-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {microgreens.map((microgreen) => (
            <div
              key={microgreen.microgreen_id}
              className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {microgreen.microgreen_name}
              </h3>

              {microgreen.image_url ? (
                <div className="relative mb-4">
                  <img
                    src={microgreen.image_url}
                    alt={microgreen.microgreen_name}
                    className="w-full h-48 object-cover rounded-lg transition-transform duration-300 hover:scale-105"
                    onError={(e) =>
                      console.error('Image load error:', microgreen.image_url, e)
                    }
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-4">No image available</p>
              )}

              <div className="flex justify-center">
                <button
                  onClick={() => navigate(`/recipe/${microgreen.microgreen_id}`)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  View More
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipesPage;
