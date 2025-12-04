import React from 'react';

interface Friend {
  id: string;
  name: string;
  streak: number;
  lives: number;
  status: string;
}

const mockFriends: Friend[] = [
  { id: '1', name: 'Vitalik.cat', streak: 42, lives: 8, status: 'Locked in' },
  { id: '2', name: 'Mitchell.cat', streak: 15, lives: 9, status: 'Grinding' },
  { id: '3', name: 'Satoshi.cat', streak: 100, lives: 9, status: 'Legendary' },
  { id: '4', name: 'CZ.cat', streak: 3, lives: 4, status: 'Rebuilding' },
  { id: '5', name: 'Brian.cat', streak: 28, lives: 7, status: 'Based' },
];

const FriendsPage: React.FC = () => {
  const handleMeow = (friendName: string) => {
    console.log(`Meowed at ${friendName}!`);
  };

  return (
    <div className="friends-page">
      <h2 className="page-title">Friends</h2>
      <div className="friends-list">
        {mockFriends.map((friend) => (
          <div key={friend.id} className="friend-card">
            <div className="friend-info">
              <h3 className="friend-name">{friend.name}</h3>
              <div className="friend-stats">
                <span className="friend-stat">
                  <span className="stat-label">Streak:</span>
                  <span className="stat-value">{friend.streak}</span>
                </span>
                <span className="friend-stat">
                  <span className="stat-label">Lives:</span>
                  <span className="stat-value">{friend.lives}/9</span>
                </span>
              </div>
              <p className="friend-status">{friend.status}</p>
            </div>
            <button 
              className="meow-button"
              onClick={() => handleMeow(friend.name)}
            >
              Meow
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendsPage;
