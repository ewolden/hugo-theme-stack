<script>
document.getElementById('recipe-form').addEventListener('submit', function(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const author = formData.get('author');
  const title = formData.get('title');
  const date = formData.get('date');
  const description = formData.get('description');
  const tags = formData.get('tags').split(',').map(tag => tag.trim());
  const categories = formData.get('categories').split(',').map(category => category.trim());
  const image = formData.get('image');
  const prepTime = formData.get('prepTime');
  const cookTime = formData.get('cookTime');
  const recipeYield = formData.get('recipeYield');
  const ingredients = formData.get('ingredients').split('\n');
  const instructions = formData.get('instructions').split('\n');

  const markdownData = generateMarkdown({
    author,
    title,
    date,
    description,
    tags,
    categories,
    image,
    prepTime,
    cookTime,
    recipeYield,
    ingredients,
    instructions
  });

  // Do something with the generated markdown data, like sending it to Azure Data Lake
  console.log(markdownData);
});

function generateMarkdown(data) {
  const ingredientsTableRows = data.ingredients.map(ingredient => `| ${ingredient} |`).join('\n');
  const instructionsListItems = data.instructions.map(instruction => `1. ${instruction}`).join('\n');

  return `
+++
author = "${data.author}"
title = "${data.title}"
date = "${data.date}"
description = "${data.description}"
tags = [${data.tags.map(tag => `"${tag}"`).join(', ')}]
categories = [${data.categories.map(category => `"${category}"`).join(', ')}]
image = "${data.image}"
prepTime = "${data.prepTime}"
cookTime = "${data.cookTime}"
recipeYield = "${data.recipeYield}"
+++

## ${data.title}
### Ingredients
${ingredientsTableRows}

### Instructions
${instructionsListItems}
  `;
}
</script>
