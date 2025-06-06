
import React from 'react';
import { ActiveMessage, Character } from '../types';
import { ThumbsUp, MessageCircle } from 'lucide-react'; // Using lucide-react for icons

interface MessageDisplayProps {
  character: Character;
  activeMessage: ActiveMessage | null;
  reactionCount: number;
  onReact: () => void;
  isLoading: boolean;
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({ character, activeMessage, reactionCount, onReact, isLoading }) => {
  return (
    <div className="my-6 p-6 bg-white shadow-xl rounded-lg max-w-md mx-auto min-h-[250px] flex flex-col justify-between border border-gray-200">
      <div>
        <div className="flex items-center mb-4">
          <img src={character.iconUrl} alt={character.name} className="w-16 h-16 rounded-full mr-4 border-2 border-holo-lightblue" />
          <div>
            <h2 className="text-2xl font-bold text-holo-blue">{character.name}</h2>
            <p className="text-sm text-holo-secondary-text">からのメッセージ</p>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center h-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-holo-blue"></div>
            <p className="ml-3 text-holo-secondary-text">メッセージを生成中...</p>
          </div>
        )}

        {!isLoading && activeMessage && (
          <div className="bg-holo-lightblue/10 p-4 rounded-md mb-4 min-h-[60px] flex items-center">
            <MessageCircle size={24} className="text-holo-blue mr-3 flex-shrink-0" />
            <p className="text-holo-text text-lg leading-relaxed">{activeMessage.text}</p>
          </div>
        )}
        
        {!isLoading && !activeMessage && (
          <div className="text-center text-holo-secondary-text py-6">
            <p>新しいメッセージをお待ちください...</p>
            <p className="text-sm">(設定した時間に通知が届きます)</p>
          </div>
        )}
      </div>

      <div className="mt-auto">
        {activeMessage && !isLoading && (
          <button
            onClick={onReact}
            className="w-full bg-holo-blue hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-150 ease-in-out flex items-center justify-center text-lg"
          >
            <ThumbsUp size={22} className="mr-2" /> ありがとう！
          </button>
        )}
        <div className="text-center mt-4 text-holo-secondary-text">
          <span className="font-semibold text-holo-blue">{reactionCount}</span> 回の「ありがとう！」
        </div>
      </div>
    </div>
  );
};

export default MessageDisplay;
