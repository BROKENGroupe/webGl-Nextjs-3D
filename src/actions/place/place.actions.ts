import { CreatePlaceSchemaType, validatePlaceInput } from "@/schemas/place.schema";
import { createPlace, getPlaces, updatePlace, deletePlace } from "@/services/placeService";

// Crear un establecimiento
export async function createPlaceAction(
  form: Readonly<CreatePlaceSchemaType>,
): Promise<any> {
  const validatedForm = await validatePlaceInput(form);
  return await createPlace(validatedForm);
}

// Obtener todos los establecimientos
export async function getPlacesAction() {
  return await getPlaces();
}

// Actualizar un establecimiento
export async function updatePlaceAction(id: string, data: any) {
  return await updatePlace(id, data);
}

// Eliminar un establecimiento
export async function deletePlaceAction(id: string) {
  return await deletePlace(id);
}