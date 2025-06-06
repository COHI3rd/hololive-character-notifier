
import React from 'react';
import { Settings } from 'lucide-react'; // Using lucide-react for icons

interface HeaderProps {
  onSettingsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSettingsClick }) => {
  return (
    <header className="bg-holo-blue text-white p-4 shadow-md flex justify-between items-center">
      <h1 className="text-xl font-bold">ホロ通知</h1>
      <button
        onClick={onSettingsClick}
        className="p-2 rounded-full hover:bg-holo-lightblue focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="設定を開く"
      >
        <Settings size={24} />
      </button>
    </header>
  );
};

export default Header;
