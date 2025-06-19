import type { Items } from "../types/items";
import uniqueItems from "./unique-items";
import setItems from "./set-items";
import runewords from "./runewords";
import runes from "./runes";

export const items: Items = { uniqueItems, setItems, runewords, runes };

const uniqueCategories = [...new Set(Object.values(uniqueItems).map((item) => item.category))];
// const setCategories = [...new Set(Object.values(setItems).map((item) => item.category))];

// console.log("Unique Categories:");
// console.log(uniqueCategories.map((cat) => `"${cat}"`).join(" | "));

// console.log("\nSet Categories:");
// console.log(setCategories.map((cat) => `"${cat}"`).join(" | "));

// console.log("\nTypeScript Union Types:");
console.log("type UniqueCategory =", uniqueCategories.map((cat) => `"${cat}"`).join(" | ") + ";");
// console.log("type SetCategory =", setCategories.map((cat) => `"${cat}"`).join(" | ") + ";");

// const checkDefenseVariables = (uniqueItems: Record<string, UniqueItem>) => {
//     const suspiciousItems: string[] = [];

//     Object.entries(uniqueItems).forEach(([key, item]) => {
//         // Check if item is armor-related
//         const armorCategories = [
//             "Armor",
//             "Belts",
//             "Boots",
//             "Gloves",
//             "Helmets",
//             "Circlets",
//             "Pelts",
//             "Shields",
//         ];
//         if (!armorCategories.some((category) => item.category.includes(category))) {
//             return;
//         }

//         // Find defense implicit with variable
//         const hasDefenseVariable = item.implicits.some((implicit) =>
//             implicit[0].includes("Defense: {{1}}")
//         );

//         if (!hasDefenseVariable) {
//             return;
//         }

//         // Check for defense-modifying affixes
//         const hasDefenseModifier = item.affixes.some((affix) => {
//             const affixText = affix[0];
//             return (
//                 affixText.includes("Defense") &&
//                 (affixText.includes("Enhanced Defense") ||
//                     affixText.match(/\+\d+\s+Defense/) ||
//                     affixText.match(/\+\{\{\d\}\}\s+Defense/))
//             );
//         });

//         // If has defense variable but no defense modifier, it's suspicious
//         if (!hasDefenseModifier) {
//             suspiciousItems.push(item.name);
//         }
//     });

//     console.log("Items with potentially incorrect defense variables:");
//     suspiciousItems.forEach((name) => console.log(`- ${name}`));

//     return suspiciousItems;
// };

// checkDefenseVariables(uniqueItems);

// const checkBlockChanceVariables = (uniqueItems: Record<string, UniqueItem>) => {
//     const suspiciousItems: string[] = [];

//     Object.entries(uniqueItems).forEach(([key, item]) => {
//         // Check if item is shield-related
//         if (!item.category.includes("Shields")) {
//             return;
//         }

//         // Find block chance implicit with variable
//         const hasBlockChanceVariable = item.implicits.some((implicit) =>
//             implicit[0].includes("Chance to Block: {{1}}")
//         );

//         // Also check for single number block chance
//         const hasSingleBlockChance = item.implicits.some((implicit) =>
//             implicit[0].match(/Chance to Block: \d+%$/)
//         );

//         if (!hasBlockChanceVariable && !hasSingleBlockChance) {
//             return;
//         }

//         // Check for block chance modifying affixes
//         const hasBlockChanceModifier = item.affixes.some((affix) => {
//             const affixText = affix[0];
//             return (
//                 affixText.includes("Increased Chance of Blocking") &&
//                 (affixText.match(/\d+%\s+Increased Chance of Blocking/) ||
//                     affixText.match(/\{\{1\}\}%\s+Increased Chance of Blocking/))
//             );
//         });

//         // If has block chance (variable or single) but no block chance modifier, it's suspicious
//         if (!hasBlockChanceModifier) {
//             suspiciousItems.push(item.name);
//         }
//     });

//     console.log("Items with potentially incorrect block chance variables:");
//     suspiciousItems.forEach((name) => console.log(`- ${name}`));

//     return suspiciousItems;
// };

// checkBlockChanceVariables(uniqueItems);

// const checkDamageVariables = (uniqueItems: Record<string, UniqueItem>) => {
//     const suspiciousItems: string[] = [];

//     Object.entries(uniqueItems).forEach(([key, item]) => {
//         // Find damage implicit with variable
//         const hasDamageVariable = item.implicits.some(
//             (implicit) =>
//                 implicit[0].includes("One-Hand Damage: {{1}}") ||
//                 implicit[0].includes("Two-Hand Damage: {{1}}") ||
//                 implicit[0].includes("Throw Damage: {{1}}")
//         );

//         if (!hasDamageVariable) {
//             return;
//         }

//         // Check for damage modifying affixes
//         const hasDamageModifier = item.affixes.some((affix) => {
//             const affixText = affix[0];
//             return (
//                 affixText.includes("Enhanced Damage") ||
//                 affixText.includes("to Minimum Damage") ||
//                 affixText.includes("to Maximum Damage")
//             );
//         });

//         // If has damage variable but no damage modifier, it's suspicious
//         if (!hasDamageModifier) {
//             suspiciousItems.push(item.name);
//         }
//     });

//     console.log("Items with potentially incorrect damage variables:");
//     suspiciousItems.forEach((name) => console.log(`- ${name}`));

//     return suspiciousItems;
// };

// checkDamageVariables(uniqueItems);
