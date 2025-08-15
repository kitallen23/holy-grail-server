import type { Rune } from "../types/items.js";

const runes: Record<string, Rune> = {
    El: {
        name: "El",
        requiredLevel: 11,
        implicits: {
            Weapons: "+50 to Attack Rating, +1 to Light Radius",
            Armor: "+50 to Attack Rating, +1 to Light Radius",
            Helms: "+50 to Attack Rating, +1 to Light Radius",
            Shields: "+50 to Attack Rating, +1 to Light Radius",
        },
    },
    Eld: {
        name: "Eld",
        requiredLevel: 11,
        implicits: {
            Weapons: "+75% Damage to Undead, +50 to Attack Rating against Undead",
            Armor: "15% Slower Stamina Drain",
            Helms: "15% Slower Stamina Drain",
            Shields: "7% Increased Chance of Blocking",
        },
    },
    Tir: {
        name: "Tir",
        requiredLevel: 13,
        implicits: {
            Weapons: "+2 to Mana after each Kill",
            Armor: "+2 to Mana after each Kill",
            Helms: "+2 to Mana after each Kill",
            Shields: "+2 to Mana after each Kill",
        },
    },
    Nef: {
        name: "Nef",
        requiredLevel: 13,
        implicits: {
            Weapons: "Knockback",
            Armor: "+30 Defense vs. Missile",
            Helms: "+30 Defense vs. Missile",
            Shields: "+30 Defense vs. Missile",
        },
    },
    Eth: {
        name: "Eth",
        requiredLevel: 15,
        implicits: {
            Weapons: "-25% Target Defense",
            Armor: "Regenerate Mana 15%",
            Helms: "Regenerate Mana 15%",
            Shields: "Regenerate Mana 15%",
        },
    },
    Ith: {
        name: "Ith",
        requiredLevel: 15,
        implicits: {
            Weapons: "+9 to Maximum Damage",
            Armor: "15% Damage Taken Goes To Mana",
            Helms: "15% Damage Taken Goes To Mana",
            Shields: "15% Damage Taken Goes To Mana",
        },
    },
    Tal: {
        name: "Tal",
        requiredLevel: 17,
        implicits: {
            Weapons: "+75 Poison Damage over 5 seconds",
            Armor: "Poison Resist +30%",
            Helms: "Poison Resist +30%",
            Shields: "Poison Resist +35%",
        },
    },
    Ral: {
        name: "Ral",
        requiredLevel: 19,
        implicits: {
            Weapons: "Adds 5-30 Fire Damage",
            Armor: "Fire Resist +30%",
            Helms: "Fire Resist +30%",
            Shields: "Fire Resist +35%",
        },
    },
    Ort: {
        name: "Ort",
        requiredLevel: 21,
        implicits: {
            Weapons: "Adds 1-50 Lightning Damage",
            Armor: "Lightning Resist +30%",
            Helms: "Lightning Resist +30%",
            Shields: "Lightning Resist +35%",
        },
    },
    Thul: {
        name: "Thul",
        requiredLevel: 23,
        implicits: {
            Weapons: "Adds 3-14 Cold Damage",
            Armor: "Cold Resist +30%",
            Helms: "Cold Resist +30%",
            Shields: "Cold Resist +35%",
        },
    },
    Amn: {
        name: "Amn",
        requiredLevel: 25,
        implicits: {
            Weapons: "7% Life Stolen per Hit",
            Armor: "Attacker Takes Damage of 14",
            Helms: "Attacker Takes Damage of 14",
            Shields: "Attacker Takes Damage of 14",
        },
    },
    Sol: {
        name: "Sol",
        requiredLevel: 27,
        implicits: {
            Weapons: "+9 to Minimum Damage",
            Armor: "Damage Reduced by 7",
            Helms: "Damage Reduced by 7",
            Shields: "Damage Reduced by 7",
        },
    },
    Shael: {
        name: "Shael",
        requiredLevel: 29,
        implicits: {
            Weapons: "20% Increased Attack Speed",
            Armor: "20% Faster Hit Recovery",
            Helms: "20% Faster Hit Recovery",
            Shields: "20% Faster Block Rate",
        },
    },
    Dol: {
        name: "Dol",
        requiredLevel: 31,
        implicits: {
            Weapons: "Hit Causes Monster to Flee 25%",
            Armor: "Replenish Life +7",
            Helms: "Replenish Life +7",
            Shields: "Replenish Life +7",
        },
    },
    Hel: {
        name: "Hel",
        requiredLevel: 0,
        implicits: {
            Weapons: "Requirements -20%",
            Armor: "Requirements -15%",
            Helms: "Requirements -15%",
            Shields: "Requirements -15%",
        },
    },
    Io: {
        name: "Io",
        requiredLevel: 35,
        implicits: {
            Weapons: "+10 to Vitality",
            Armor: "+10 to Vitality",
            Helms: "+10 to Vitality",
            Shields: "+10 to Vitality",
        },
    },
    Lum: {
        name: "Lum",
        requiredLevel: 37,
        implicits: {
            Weapons: "+10 to Energy",
            Armor: "+10 to Energy",
            Helms: "+10 to Energy",
            Shields: "+10 to Energy",
        },
    },
    Ko: {
        name: "Ko",
        requiredLevel: 39,
        implicits: {
            Weapons: "+10 to Dexterity",
            Armor: "+10 to Dexterity",
            Helms: "+10 to Dexterity",
            Shields: "+10 to Dexterity",
        },
    },
    Fal: {
        name: "Fal",
        requiredLevel: 41,
        implicits: {
            Weapons: "+10 to Strength",
            Armor: "+10 to Strength",
            Helms: "+10 to Strength",
            Shields: "+10 to Strength",
        },
    },
    Lem: {
        name: "Lem",
        requiredLevel: 43,
        implicits: {
            Weapons: "75% Extra Gold from Monsters",
            Armor: "50% Extra Gold from Monsters",
            Helms: "50% Extra Gold from Monsters",
            Shields: "50% Extra Gold from Monsters",
        },
    },
    Pul: {
        name: "Pul",
        requiredLevel: 45,
        implicits: {
            Weapons: "+75% Damage to Demons, +100 to Attack Rating against Demons",
            Armor: "+30% Enhanced Defense",
            Helms: "+30% Enhanced Defense",
            Shields: "+30% Enhanced Defense",
        },
    },
    Um: {
        name: "Um",
        requiredLevel: 47,
        implicits: {
            Weapons: "+25% Chance of Open Wounds",
            Armor: "All Resistances +15",
            Helms: "All Resistances +15",
            Shields: "All Resistances +22",
        },
    },
    Mal: {
        name: "Mal",
        requiredLevel: 49,
        implicits: {
            Weapons: "Prevent Monster Heal",
            Armor: "Magic Damage Reduced by 7",
            Helms: "Magic Damage Reduced by 7",
            Shields: "Magic Damage Reduced by 7",
        },
    },
    Ist: {
        name: "Ist",
        requiredLevel: 51,
        implicits: {
            Weapons: "30% Better Chance of Getting Magic Items",
            Armor: "25% Better Chance of Getting Magic Items",
            Helms: "25% Better Chance of Getting Magic Items",
            Shields: "25% Better Chance of Getting Magic Items",
        },
    },
    Gul: {
        name: "Gul",
        requiredLevel: 53,
        implicits: {
            Weapons: "20% Bonus to Attack Rating",
            Armor: "5% to Maximum Poison Resist",
            Helms: "5% to Maximum Poison Resist",
            Shields: "5% to Maximum Poison Resist",
        },
    },
    Vex: {
        name: "Vex",
        requiredLevel: 55,
        implicits: {
            Weapons: "7% Mana Stolen per Hit",
            Armor: "+5% to Maximum Fire Resist",
            Helms: "+5% to Maximum Fire Resist",
            Shields: "+5% to Maximum Fire Resist",
        },
    },
    Ohm: {
        name: "Ohm",
        requiredLevel: 57,
        implicits: {
            Weapons: "+50% Enhanced Damage",
            Armor: "+5% to Maximum Cold Resist",
            Helms: "+5% to Maximum Cold Resist",
            Shields: "+5% to Maximum Cold Resist",
        },
    },
    Lo: {
        name: "Lo",
        requiredLevel: 59,
        implicits: {
            Weapons: "+20% Deadly Strike",
            Armor: "+5% to Maximum Lightning Resist",
            Helms: "+5% to Maximum Lightning Resist",
            Shields: "+5% to Maximum Lightning Resist",
        },
    },
    Sur: {
        name: "Sur",
        requiredLevel: 61,
        implicits: {
            Weapons: "Hit Blinds Target",
            Armor: "Increased Maximum Mana 5%",
            Helms: "Increased Maximum Mana 5%",
            Shields: "+50 to Mana",
        },
    },
    Ber: {
        name: "Ber",
        requiredLevel: 63,
        implicits: {
            Weapons: "+20% Chance of Crushing Blow",
            Armor: "Physical Damage Received Reduced by 8%",
            Helms: "Physical Damage Received Reduced by 8%",
            Shields: "Physical Damage Received Reduced by 8%",
        },
    },
    Jah: {
        name: "Jah",
        requiredLevel: 65,
        implicits: {
            Weapons: "Ignore Target's Defense",
            Armor: "Increase Maximum Life 5%",
            Helms: "Increase Maximum Life 5%",
            Shields: "+50 to Life",
        },
    },
    Cham: {
        name: "Cham",
        requiredLevel: 67,
        implicits: {
            Weapons: "Freezes Target +3",
            Armor: "Cannot Be Frozen",
            Helms: "Cannot Be Frozen",
            Shields: "Cannot Be Frozen",
        },
    },
    Zod: {
        name: "Zod",
        requiredLevel: 69,
        implicits: {
            Weapons: "Indestructible",
            Armor: "Indestructible",
            Helms: "Indestructible",
            Shields: "Indestructible",
        },
    },
};

export default runes;
