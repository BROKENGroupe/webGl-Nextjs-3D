import { CreatePlaceSchemaType, validatePlaceFormData } from "@/schemas/place.schema";
import { createPlace, getPlacesWorkspace, updatePlace, deletePlace } from "@/services/placeService";

// Crear un establecimiento
export async function createPlaceAction(
  form: FormData,
): Promise<any> {
  const formData = new FormData();
  formData.append('name', form.get('name') as string);
  formData.append('address', form.get('address') as string);
  formData.append('image', form.get('image') as File);
  formData.append('description', form.get('description') as string);
  formData.append('categoryId', form.get('categoryId') as string);
  formData.append('status', 'active');
  return await createPlace(formData);
}

// Obtener todos los establecimientos
export async function getPlacesWorkspaceAction() {
  return await getPlacesWorkspace();
}

// Actualizar un establecimiento
export async function updatePlaceAction(id: string, data: any) {
  return await updatePlace(id, data);
}

// Eliminar un establecimiento
export async function deletePlaceAction(id: string) {
  return await deletePlace(id);
}