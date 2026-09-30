import { ImageSourcePropType } from 'react-native';

const SEED_IMAGE_SCHEME = 'seed-recipe://';

export const seedRecipeImages = {
  avocadoEggToast: `${SEED_IMAGE_SCHEME}avocado-egg-toast`,
  tomatoBasilPasta: `${SEED_IMAGE_SCHEME}tomato-basil-pasta`,
  berryYogurtParfait: `${SEED_IMAGE_SCHEME}berry-yogurt-parfait`,
  bananaOatPancakes: `${SEED_IMAGE_SCHEME}banana-oat-pancakes`,
  sesameVegetableRice: `${SEED_IMAGE_SCHEME}sesame-vegetable-rice`,
  citrusChickenSalad: `${SEED_IMAGE_SCHEME}citrus-chicken-salad`,
  chocolateBrownies: `${SEED_IMAGE_SCHEME}chocolate-brownies`,
  crispyVegetableRolls: `${SEED_IMAGE_SCHEME}crispy-vegetable-rolls`,
  mangoBananaSmoothie: `${SEED_IMAGE_SCHEME}mango-banana-smoothie`,
} as const;

const localSeedRecipeImages: Record<string, ImageSourcePropType> = {
  [seedRecipeImages.avocadoEggToast]: require('../assets/seed-recipes/avocado-egg-toast.jpg'),
  [seedRecipeImages.tomatoBasilPasta]: require('../assets/seed-recipes/tomato-basil-pasta.jpg'),
  [seedRecipeImages.berryYogurtParfait]: require('../assets/seed-recipes/berry-yogurt-parfait.jpg'),
  [seedRecipeImages.bananaOatPancakes]: require('../assets/seed-recipes/banana-oat-pancakes.jpg'),
  [seedRecipeImages.sesameVegetableRice]: require('../assets/seed-recipes/sesame-vegetable-rice.jpg'),
  [seedRecipeImages.citrusChickenSalad]: require('../assets/seed-recipes/citrus-chicken-salad.jpg'),
  [seedRecipeImages.chocolateBrownies]: require('../assets/seed-recipes/chocolate-brownies.jpg'),
  [seedRecipeImages.crispyVegetableRolls]: require('../assets/seed-recipes/crispy-vegetable-rolls.jpg'),
  [seedRecipeImages.mangoBananaSmoothie]: require('../assets/seed-recipes/mango-banana-smoothie.jpg'),
};

export function getRecipeImageSource(imageUri: string): ImageSourcePropType {
  return localSeedRecipeImages[imageUri] ?? { uri: imageUri };
}
