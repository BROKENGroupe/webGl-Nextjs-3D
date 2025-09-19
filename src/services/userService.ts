export const registerUser = async (user:any) => {
  const res = await fetch(`/api/users/register`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'create-user',
      payload: user,
    }),
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  return res.json();
};

export const registerUserWithGoogle = async (user:any) => {
  const res = await fetch(`/api/users/register`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'create-user-google',
      payload: user,
    }),
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  return res.json();
};


