import React from "react";

type Friend = {
  id: number;
  name: string;
  handle: string;
  streak: number;
  lives: number;
  status: string;
};

const mockFriends: Friend[] = [
  { id: 1, name: "Vitalik", handle: "vitalik.cat", streak: 42, lives: 8, status: "Locked in" },
  { id: 2, name: "Mitchell", handle: "mitchell.cat", streak: 15, lives: 9, status: "Grinding" },
  { id: 3, name: "Satoshi", handle: "satoshi.cat", streak: 100, lives: 9, status: "Legendary" },
  { id: 4, name: "CZ", handle: "cz.cat", streak: 3, lives: 4, status: "Rebuilding" },
];

const FriendsPage: React.FC = () => {
  return (
    <div className="friends-page">
      <h2 className="page-title">Friends</h2>
      <p className="page-subtitle">
        See how your friends&rsquo; cats are doing. These are mock profiles for the demo.
      </p>

      <div className="friends-list">
        {mockFriends.map((friend) => (
          <div key={friend.id} className="friend-card">
            <div className="friend-info">
              <div className="friend-name-row">
                <span className="friend-name">{friend.handle}</span>
                <span className="friend-tag">Friend</span>
              </div>

              <div className="friend-stats">
                <span className="friend-stat">
                  Streak <span className="stat-value">{friend.streak} days</span>
                </span>
                <span className="friend-stat">
                  Lives <span className="stat-value">{friend.lives}/9</span>
                </span>
              </div>

              <p className="friend-status">{friend.status}</p>
            </div>

            <div className="friend-actions">
              <button className="meow-button" type="button">
                Meow
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendsPage;