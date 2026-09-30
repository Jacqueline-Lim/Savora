import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Camera } from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getRecipeImageSource } from '../../data/seedRecipeImages';
import { recipeTypes } from '../../data/recipeTypes';
import { RecipeInput } from '../../domain/models/Recipe';
import { AppButton } from './AppButton';
import { FormField } from './FormField';
import { colors, radius, spacing } from '../theme';

interface RecipeFormProps {
  initialValue?: RecipeInput;
  submitLabel: string;
  onSubmit: (input: RecipeInput) => Promise<void>;
  onCancel?: () => void;
}

export function RecipeForm({
  initialValue,
  submitLabel,
  onSubmit,
  onCancel,
}: RecipeFormProps): React.JSX.Element {
  const [title, setTitle] = useState(initialValue?.title ?? '');
  const [typeId, setTypeId] = useState(
    initialValue?.typeId ?? recipeTypes[0]?.id ?? '',
  );
  const [imageUri, setImageUri] = useState(initialValue?.imageUri ?? '');
  const [ingredientsText, setIngredientsText] = useState(
    initialValue?.ingredients.join('\n') ?? '',
  );
  const [stepsText, setStepsText] = useState(
    initialValue?.steps.join('\n') ?? '',
  );
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const input = useMemo<RecipeInput>(
    () => ({
      title,
      typeId,
      imageUri,
      ingredients: toLines(ingredientsText),
      steps: toLines(stepsText),
    }),
    [title, typeId, imageUri, ingredientsText, stepsText],
  );

  const choosePhoto = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 0.8,
    });

    if (result.didCancel) {
      return;
    }
    if (result.errorCode) {
      Alert.alert(
        'Photo unavailable',
        result.errorMessage ?? 'Please try choosing another photo.',
      );
      return;
    }

    const uri = result.assets?.[0]?.uri;
    if (uri) {
      setImageUri(uri);
      setErrorMessage(null);
    }
  };

  const submit = async () => {
    const validationMessage = validate(input);
    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    try {
      await onSubmit(input);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'The recipe could not be saved. Please try again.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <Text style={styles.heading}>Recipe information</Text>
        </View>

        <View style={styles.photoContainer}>
          <View style={styles.photoFrame}>
            {imageUri ? (
              <Image
                accessibilityLabel="Selected recipe photo"
                source={getRecipeImageSource(imageUri)}
                resizeMode="cover"
                style={styles.photo}
              />
            ) : (
              <View style={[styles.photo, styles.photoPlaceholder]}>
                <Camera
                  accessibilityElementsHidden
                  color={colors.primary}
                  size={34}
                  strokeWidth={1.8}
                />
                <Text style={styles.placeholderText}>No photo selected</Text>
              </View>
            )}
          </View>
          <AppButton
            label={imageUri ? 'Change photo' : 'Choose photo'}
            onPress={() => {
              choosePhoto().catch(() => undefined);
            }}
            variant="secondary"
          />
        </View>

        <FormField
          label="Recipe name"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Vegetable curry"
          returnKeyType="next"
          maxLength={80}
        />

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Recipe type</Text>
          <View style={styles.pickerFrame}>
            <Picker
              accessibilityLabel="Recipe type"
              selectedValue={typeId}
              onValueChange={value => setTypeId(String(value))}
              mode={Platform.OS === 'android' ? 'dropdown' : undefined}
              style={styles.picker}
            >
              {recipeTypes.map(type => (
                <Picker.Item key={type.id} label={type.name} value={type.id} />
              ))}
            </Picker>
          </View>
        </View>

        <FormField
          label="Ingredients"
          value={ingredientsText}
          onChangeText={setIngredientsText}
          placeholder={'2 tomatoes\n1 onion\n1 tbsp olive oil'}
          multiline
          numberOfLines={5}
        />

        <FormField
          label="Steps"
          value={stepsText}
          onChangeText={setStepsText}
          placeholder={
            'Chop the vegetables.\nHeat the pan.\nCook for 10 minutes.'
          }
          multiline
          numberOfLines={6}
        />

        {errorMessage ? (
          <View accessibilityLiveRegion="polite" style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <AppButton
            label={submitLabel}
            onPress={() => {
              submit().catch(() => undefined);
            }}
            loading={isSaving}
            style={styles.actionButton}
          />
          {onCancel ? (
            <AppButton
              label="Cancel"
              onPress={onCancel}
              disabled={isSaving}
              variant="secondary"
              style={styles.actionButton}
            />
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function toLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map(item => item.trim())
    .filter(Boolean);
}

function validate(input: RecipeInput): string | null {
  if (!input.title.trim()) {
    return 'Enter a recipe name.';
  }
  if (!input.typeId) {
    return 'Choose a recipe type.';
  }
  if (!input.imageUri) {
    return 'Choose a recipe photo.';
  }
  if (input.ingredients.length === 0) {
    return 'Add at least one ingredient.';
  }
  if (input.steps.length === 0) {
    return 'Add at least one preparation step.';
  }
  return null;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  heading: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
  },
  photoContainer: {
    gap: spacing.sm,
  },
  photoFrame: {
    width: '100%',
    aspectRatio: 16 / 9,
    overflow: 'hidden',
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: colors.inkMuted,
    fontSize: 15,
  },
  fieldGroup: {
    gap: spacing.sm,
  },
  label: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  pickerFrame: {
    minHeight: 50,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  picker: {
    color: colors.ink,
  },
  errorBox: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSurface,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  actions: {
    gap: spacing.sm,
  },
  actionButton: {
    width: '100%',
  },
});
