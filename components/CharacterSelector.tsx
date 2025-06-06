
import React from 'react';
import { CharacterId } from '../types';
import { CHARACTERS_DATA } from '../constants';

interface CharacterSelectorProps {
  selectedCharacterId: CharacterId;
  onSelectCharacter: (id: CharacterId) => void;
}

const CharacterSelector: React.FC<CharacterSelectorProps> = ({ selectedCharacterId, onSelectCharacter }) => {
  const characters = Object.values(CHARACTERS_DATA);

  return (
    <div className="my-6">
      <h2 className="text-lg font-semibold mb-3 text-holo-secondary-text text-center">キャラクター選択</h2>
      <div className="flex justify-center space-x-4">
        {characters.map((char) => (
          <button
            key={char.id}
            onClick={() => onSelectCharacter(char.id)}
            className={`p-3 border-2 rounded-lg transition-all duration-150 ease-in-out
                        ${selectedCharacterId === char.id ? 'border-holo-blue bg-holo-lightblue/20 shadow-lg scale-105' : 'border-gray-300 hover:border-holo-lightblue'}`}
          >
            <img src={char.iconUrl} alt={char.name} className="w-20 h-20 rounded-full mx-auto mb-2" />
            <p className={`text-center font-medium ${selectedCharacterId === char.id ? 'text-holo-blue' : 'text-holo-text'}`}>{char.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CharacterSelector;
