const baseUrl = process.env.API_BASE_URL;

// export const createPlace = async (place: any) => {
//   console.log('Creating place with data:', place);
//   const res = await fetch(`/api/places`, {
//     method: "POST",
//     body: JSON.stringify({
//       action: "create-place",
//       payload: place,
//     }),
//     cache: "no-store",
//   });
//   return res.json();
// };

export const createPlace = async (form: FormData) => {  
  const res = await fetch('/api/places', {
    method: 'POST',
    body: form, 
  });

  return res.json();
};

// Obtener todos los establecimientos
export const getPlacesWorkspace = async () => {
  const res = await fetch(`/api/places`, {
    method: "GET",
    cache: "no-store",
  });
  return res.json();
};

// Actualizar un establecimiento
export const updatePlace = async (placeId: string, data: any) => {
  
  const res = await fetch(`/api/places/${placeId}`, {
    method: "PUT",
    body: JSON.stringify({
      action: "update-place",
      payload: data,
    }),
    cache: "no-store",
  });
  return res.json();
};

// Eliminar un establecimiento
export const deletePlace = async (placeId: string) => {
  const res = await fetch(`/api/places/${placeId}`, {
    method: "DELETE",
    cache: "no-store",
  });
  return res.json();
};


