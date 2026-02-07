type KeepButton = HTMLButtonElement & {
    dataset: {
        keepIngredients?: string;
        keepTitle?: string;
        keepLabel?: string;
        keepSuccess?: string;
        keepError?: string;
    }
};

const setButtonLabel = (button: KeepButton, label: string) => {
    const labelElement = button.querySelector<HTMLElement>('.article-recipe-action__label');
    if (labelElement) {
        labelElement.textContent = label;
    } else {
        button.textContent = label;
    }
};

const parseIngredients = (button: KeepButton): string[] => {
    const ingredientsData = button.dataset.keepIngredients;
    if (!ingredientsData) {
        return [];
    }

    try {
        const parsed = JSON.parse(ingredientsData);
        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed
            .map(item => typeof item === 'string' ? item.trim() : '')
            .filter((item): item is string => item.length > 0);
    } catch (error) {
        console.error('Unable to parse ingredients for Google Keep button', error);
        return [];
    }
};

const openGoogleKeep = (title: string, ingredients: string[]) => {
    const listText = ingredients.map(item => `- ${item}`).join('\n');
    const keepUrl = new URL('https://keep.google.com/u/0/create');
    keepUrl.searchParams.set('title', title);
    keepUrl.searchParams.set('text', listText);

    window.open(keepUrl.toString(), '_blank', 'noopener,noreferrer');
};

const shareToKeep = async (noteTitle: string, ingredients: string[]) => {
    const text = ingredients.map(item => `• ${item}`).join('\n');
    const shareData = { title: noteTitle, text };

    if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
        await navigator.share(shareData);
        return true;
    }

    return false;
};

export const setupGoogleKeepButtons = () => {
    const keepButtons = document.querySelectorAll<KeepButton>('[data-keep-ingredients]');

    keepButtons.forEach(button => {
        const ingredients = parseIngredients(button);
        if (!ingredients.length) {
            button.disabled = true;
            return;
        }

        const baseLabel = button.dataset.keepLabel || button.textContent?.trim() || '';
        const successLabel = button.dataset.keepSuccess || 'Ingredients copied! Opening Google Keep...';
        const errorLabel = button.dataset.keepError || "Couldn't copy. Opening Google Keep...";

        button.addEventListener('click', async () => {
            const noteTitle = button.dataset.keepTitle
                ? `${button.dataset.keepTitle} — Ingredients`
                : 'Recipe ingredients';

            const shared = await shareToKeep(noteTitle, ingredients).catch(() => false);
            if (shared) {
                return;
            }

            const noteBody = `${noteTitle}\n${ingredients.map(item => `- ${item}`).join('\n')}`;
            const resetLabel = () => {
                if (baseLabel) {
                    setButtonLabel(button, baseLabel);
                }
            };

            try {
                await navigator.clipboard.writeText(noteBody);
                setButtonLabel(button, successLabel);
                openGoogleKeep(noteTitle, ingredients);
            } catch (error) {
                console.error('Failed to copy ingredients to clipboard', error);
                setButtonLabel(button, errorLabel);
                openGoogleKeep(noteTitle, ingredients);
            } finally {
                window.setTimeout(resetLabel, 1800);
            }
        });
    });
};
