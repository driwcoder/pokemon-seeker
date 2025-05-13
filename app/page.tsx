'use client'
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Search, Loader2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

type Pokemon = {
  id: number;
  name: string;
  types: {
    type: {
      name: string;
    };
  }[];
  height: number;
  weight: number;
  abilities: {
    ability: {
      name: string;
    };
  }[];
  sprites: {
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
    front_default: string;
  };
};

const typeColors: Record<string, string> = {
  fire: 'bg-[#F08030]',
  water: 'bg-[#6890F0]',
  grass: 'bg-[#78C850]',
  electric: 'bg-[#F8D030]',
  psychic: 'bg-[#F85888]',
  ice: 'bg-[#98D8D8]',
  dragon: 'bg-[#7038F8]',
  dark: 'bg-[#705848]',
  fairy: 'bg-[#EE99AC]',
  normal: 'bg-[#A8A878]',
  fighting: 'bg-[#C03028]',
  flying: 'bg-[#A890F0]',
  poison: 'bg-[#A040A0]',
  ground: 'bg-[#E0C068]',
  rock: 'bg-[#B8A038]',
  bug: 'bg-[#A8B820]',
  ghost: 'bg-[#705898]',
  steel: 'bg-[#B8B8D0]',
};

export default function PokemonPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPokemonByName = async (name: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
      if (!response.ok) throw new Error('Pokemon not found');
      const data = await response.json();
      setPokemonList([data]);
    } catch {
      setError('Pokemon not found. Please try another name.');
      setPokemonList([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPokemonByType = async (type: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`https://pokeapi.co/api/v2/type/${type.toLowerCase()}`);
      if (!response.ok) throw new Error('Type not found');
      const data = await response.json();
      const pokemonUrls = data.pokemon.slice(0, 20).map((p: { pokemon: { url: string } }) => p.pokemon.url);
      const pokemonData = await Promise.all(pokemonUrls.map(async (url: string) => {
        const res = await fetch(url);
        return res.json();
      }));
      setPokemonList(pokemonData);
    } catch {
      setError('Failed to load Pokemon by type. Please try again.');
      setPokemonList([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      fetchPokemonByName(searchTerm);
    }
  };

  useEffect(() => {
    fetchPokemonByType('fire');
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-[#2563eb] text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-center">Pokemon Search</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Search Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search Pokemon by name..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-[#2563eb] text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  'Search'
                )}
              </button>
            </form>
          </div>

          {/* Category Filter */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Browse by Type</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {Object.entries(typeColors).map(([type, color]) => (
                <button
                  key={type}
                  onClick={() => fetchPokemonByType(type)}
                  className={twMerge(
                    'px-3 py-2 rounded-lg text-white capitalize hover:opacity-90 transition-opacity',
                    color
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="text-center py-8">
              <Loader2 className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2563eb]" />
              <p className="mt-4 text-gray-600">Loading Pokemon data...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8 rounded">
              <p>{error}</p>
            </div>
          )}

          {/* Results */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pokemonList.map((pokemon) => {
              const primaryType = pokemon.types[0].type.name;
              const typeColor = typeColors[primaryType] || 'bg-gray-500';

              return (
                <div
                  key={pokemon.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className={twMerge('p-4 text-white', typeColor)}>
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold capitalize">{pokemon.name}</h3>
                      <span className="text-sm font-semibold">#{pokemon.id}</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {pokemon.types.map((type) => (
                        <span
                          key={type.type.name}
                          className="px-2 py-1 text-xs rounded-full bg-black bg-opacity-30 capitalize"
                        >
                          {type.type.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-center mb-4">
                      <Image
                        src={
                          pokemon.sprites.other['official-artwork'].front_default ||
                          pokemon.sprites.front_default
                        }
                        alt={pokemon.name}
                        width={160}
                        height={160}
                        className="object-contain"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Height</p>
                        <p className="font-semibold">{pokemon.height / 10}m</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Weight</p>
                        <p className="font-semibold">{pokemon.weight / 10}kg</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">Abilities</p>
                      <p className="font-semibold">
                        {pokemon.abilities
                          .map((a) => a.ability.name.replace('-', ' '))
                          .join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>
            Pokemon data from{' '}
            <a
              href="https://pokeapi.co/"
              className="text-[#2563eb] hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              PokeAPI
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
