import React from "react";
import { useSelector } from "react-redux";

function UserProfile() {
  const { user } = useSelector((state) => state.auth);

  return (
    <section className="heading">
      <h1>User Profile</h1>
      {user ? (
        <div>
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
        </div>
      ) : (
        <p>Not logged in.</p>
      )}
    </section>
  );
}

export default UserProfile;
