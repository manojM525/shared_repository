import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE_URL } from '../config';

// Define interfaces directly in the file
interface RecipeContent {
  content_id: string;
  recipe_id: string;
  type: string;
  content: string;
  order_num: number;
  created_at: string;
}

interface Recipe {
  recipe_id: string;
  title: string;
  created_at: string;
  contents: RecipeContent[];
  microgreen_id: string;
}

interface Microgreen {
  microgreen_id: string;
  microgreen_name: string;
  description?: string;
  image_url?: string;
}

const RecipeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [microgreenName, setMicrogreenName] = useState<string | undefined>(undefined);
  const [microgreenDescription, setMicrogreenDescription] = useState<string>('');
  const [microgreenImage, setMicrogreenImage] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchRecipes = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/public/recipes?microgreen_id=${id}`);
      if (!res.ok) throw new Error(`Failed to fetch recipes: ${res.statusText}`);
      const data = await res.json();
      setRecipes(data.recipes || []);

      // Fetch microgreen details for display
      const microgreenRes = await fetch(`${API_BASE_URL}/api/public/microgreens`);
      if (microgreenRes.ok) {
        const microgreenData = await microgreenRes.json();
        const selectedMicrogreen = microgreenData.microgreens.find((m: Microgreen) => m.microgreen_id === id);
        setMicrogreenName(selectedMicrogreen ? selectedMicrogreen.microgreen_name : 'Unknown Microgreen');
        setMicrogreenDescription(selectedMicrogreen?.description || '');
        setMicrogreenImage(selectedMicrogreen?.image_url);
      }
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError((error as Error).message);
      setRecipes([]);
      setMicrogreenName(undefined);
      setMicrogreenDescription('');
      setMicrogreenImage(undefined);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchRecipes();
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-lg animate-spin"></div>
      </div>
    );
  }

  if (error || recipes.length === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <p className="text-red-600 mb-6 text-lg font-medium">{error || 'No recipes found'}</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto bg-white">
      <h1 className="text-5xl font-bold text-gray-900 mb-10">Recipes for {microgreenName}</h1>

      {/* Microgreen Description Section */}
      {microgreenDescription && (
        <div className="mb-10 rounded-xl overflow-hidden shadow-sm">
          {/* <div className="relative bg-green-600 text-white p-6"> */}
            {/* <h2 className="text-3xl font-bold">{microgreenName}</h2> */}
            {/* {microgreenImage && (
              <img
                src={microgreenImage}
                alt={microgreenName || undefined}
                className="absolute top-2 right-2 w-20 h-20 object-cover rounded"
                onError={(e) => console.error('Image load error:', microgreenImage, e)}
              />
            )} */}
          {/* </div> */}
          <div className="p-6 bg-white">
            <div className="text-gray-600 text-lg leading-relaxed">
              {microgreenDescription
                .split('\n')
                .filter((line) => line.trim())
                .map((line, index) => {
                  const trimmed = line.trim();
                  if (trimmed.startsWith('□') || trimmed.startsWith('☐') || trimmed.startsWith('-')) {
                    const bulletText = trimmed.substring(trimmed.indexOf(' ') + 1).trim();
                    const colonIndex = bulletText.indexOf(':');
                    let textContent;
                    if (colonIndex !== -1) {
                      const before = bulletText.substring(0, colonIndex);
                      const after = bulletText.substring(colonIndex + 1).trim();
                      textContent = (
                        <span className="flex-1">
                          <strong>{before}:</strong> {after}
                        </span>
                      );
                    } else {
                      textContent = <span className="flex-1">{bulletText}</span>;
                    }
                    return (
                      <div key={index} className="flex items-start mb-3">
                        <span className="text-green-600 mr-3 mt-1 flex-shrink-0">✓</span>
                        {textContent}
                      </div>
                    );
                  } else {
                    const pText = trimmed;
                    const colonIndex = pText.indexOf(':');
                    let pContent;
                    if (colonIndex !== -1) {
                      const before = pText.substring(0, colonIndex);
                      const after = pText.substring(colonIndex + 1).trim();
                      pContent = (
                        <p key={index} className="mb-4 font-semibold">
                          <strong>{before}:</strong> {after}
                        </p>
                      );
                    } else {
                      pContent = <p key={index} className="mb-4 font-semibold">{pText}</p>;
                    }
                    return pContent;
                  }
                })}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {recipes.map((recipe, index) => {
          // Group contents by type and sort by order_num
          const sortedContents = [...recipe.contents].sort((a, b) => a.order_num - b.order_num);
          const imageContent = sortedContents.find(c => c.type === 'image');
          const ingredientsContent = sortedContents.filter(c => c.type === 'ingredient' || c.type === 'p');
          const instructionsContent = sortedContents.filter(c => c.type === 'instruction' || c.type === 'step');

          // Alternate layout: text left for odd indices, image left for even indices
          const isTextLeft = index % 2 === 0;

          return (
            <div key={recipe.recipe_id}>
              <div className="flex flex-col md:flex-row md:items-center">
                {isTextLeft ? (
                  <>
                    {/* Text Content (Left Column) */}
                    <div
                      className="w-full md:w-1/2 p-8 bg-white hover:bg-[#F4A900] hover:text-white transition-colors duration-300"
                    >
                      {/* Recipe Title */}
                      <h2 className="text-4xl font-bold mb-8">
                        {index + 1}. {recipe.title}
                      </h2>

                      {/* Ingredients */}
                      <div className="mb-10">
                        <h3 className="text-2xl font-semibold border-b-2 border-gray-300 mb-8">Ingredients:</h3>
                        {ingredientsContent.length > 0 ? (
                          <ul className="space-y-6">
                            {ingredientsContent.map((ingredient, idx) => (
                              <li key={ingredient.content_id} className="text-xl flex items-start">
                                <span className="text-[#FFCA28] mr-4">✓</span>
                                {ingredient.content}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500 text-lg">No ingredients listed</p>
                        )}
                      </div>

                      {/* Instructions */}
                      <div>
                        <h3 className="text-2xl font-semibold border-b-2 border-gray-300 mb-8">Instructions:</h3>
                        {instructionsContent.length > 0 ? (
                          <ol className="space-y-6 list-decimal list-inside">
                            {instructionsContent.map((instruction, idx) => (
                              <li key={instruction.content_id} className="text-xl flex items-start">
                                <span className="text-[#FFCA28] mr-4">✓</span>
                                {instruction.content}
                              </li>
                            ))}
                          </ol>
                        ) : (
                          <p className="text-gray-500 text-lg">No instructions available</p>
                        )}
                      </div>
                    </div>

                    {/* Gap and Image (Right Column) */}
                    <div className="w-6 md:w-6"></div> {/* Gap */}
                    <div className="w-full md:w-1/2">
                      <div className="h-64">
                        {imageContent ? (
                          <img
                            src={imageContent.content}
                            alt={recipe.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <p className="text-gray-500 text-lg text-center">No image</p>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Image (Left Column) */}
                    <div className="w-full md:w-1/2">
                      <div className="h-64">
                        {imageContent ? (
                          <img
                            src={imageContent.content}
                            alt={recipe.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <p className="text-gray-500 text-lg text-center">No image</p>
                        )}
                      </div>
                    </div>

                    {/* Gap and Text (Right Column) */}
                    <div className="w-6 md:w-6"></div> {/* Gap */}
                    <div
                      className="w-full md:w-1/2 p-8 bg-white hover:bg-[#F4A900] hover:text-white transition-colors duration-300"
                    >
                      {/* Recipe Title */}
                      <h2 className="text-4xl font-bold mb-8">
                        {index + 1}. {recipe.title}
                      </h2>

                      {/* Ingredients */}
                      <div className="mb-10">
                        <h3 className="text-2xl font-semibold border-b-2 border-gray-300 mb-8">Ingredients:</h3>
                        {ingredientsContent.length > 0 ? (
                          <ul className="space-y-6">
                            {ingredientsContent.map((ingredient, idx) => (
                              <li key={ingredient.content_id} className="text-xl flex items-start">
                                <span className="text-[#FFCA28] mr-4">✓</span>
                                {ingredient.content}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500 text-lg">No ingredients listed</p>
                        )}
                      </div>

                      {/* Instructions */}
                      <div>
                        <h3 className="text-2xl font-semibold border-b-2 border-gray-300 mb-8">Instructions:</h3>
                        {instructionsContent.length > 0 ? (
                          <ol className="space-y-6 list-decimal list-inside">
                            {instructionsContent.map((instruction, idx) => (
                              <li key={instruction.content_id} className="text-xl flex items-start">
                                <span className="text-[#FFCA28] mr-4">✓</span>
                                {instruction.content}
                              </li>
                            ))}
                          </ol>
                        ) : (
                          <p className="text-gray-500 text-lg">No instructions available</p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecipeDetailPage;