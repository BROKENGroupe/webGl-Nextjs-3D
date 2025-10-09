import { AuthHeaders } from "@/_lib/authHeaders";

export const registerUser = async (user: any) => {
  const res = await fetch(`/api/accounts/register`, {
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


export const registerAccount = async (account: any) => {
  console.log('Registering account with data:', account);
  const res = await fetch(`/api/accounts/create`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'create-account',
      payload: account,
    }),
    headers: AuthHeaders(account),
    cache: 'no-store',
  });

  return res.json();
};

export const registerUserWithGoogle = async (user: any) => {
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


