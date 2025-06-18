type UniqueCategory =
    | "Unique Armor"
    | "Exceptional Unique Armor"
    | "Elite Unique Armor"
    | "Unique Axes"
    | "Exceptional Unique Axes"
    | "Elite Unique Axes"
    | "Unique Belts"
    | "Exceptional Unique Belts"
    | "Elite Unique Belts"
    | "Unique Boots"
    | "Exceptional Unique Boots"
    | "Elite Unique Boots"
    | "Unique Bows"
    | "Exceptional Unique Bows"
    | "Elite Unique Bows"
    | "Unique Crossbows"
    | "Exceptional Unique Crossbows"
    | "Elite Unique Crossbows"
    | "Unique Daggers"
    | "Exceptional Unique Daggers"
    | "Elite Unique Daggers"
    | "Unique Gloves"
    | "Exceptional Unique Gloves"
    | "Elite Unique Gloves"
    | "Unique Helmets"
    | "Exceptional Unique Helmets"
    | "Elite Unique Helmets"
    | "Elite Unique Circlets"
    | "Elite Unique Javelins"
    | "Unique Amulets"
    | "Unique Rings"
    | "Unique Hammers"
    | "Exceptional Unique Hammers"
    | "Elite Unique Hammers"
    | "Unique Maces"
    | "Exceptional Unique Maces"
    | "Elite Unique Maces"
    | "Unique Polearms"
    | "Exceptional Unique Polearms"
    | "Elite Unique Polearms"
    | "Unique Scepters"
    | "Exceptional Unique Scepters"
    | "Elite Unique Scepters"
    | "Unique Shields"
    | "Exceptional Unique Shields"
    | "Elite Unique Shields"
    | "Unique Spears"
    | "Exceptional Unique Spears"
    | "Elite Unique Spears"
    | "Unique Staves"
    | "Exceptional Unique Staves"
    | "Elite Unique Staves"
    | "Unique Swords"
    | "Exceptional Unique Swords"
    | "Elite Unique Swords"
    | "Unique Throwing Weapons"
    | "Exceptional Unique Throwing Weapons"
    | "Elite Unique Throwing Weapons"
    | "Unique Wands"
    | "Exceptional Unique Wands"
    | "Elite Unique Wands"
    | "Exceptional Unique Amazon Spears"
    | "Elite Unique Amazon Spears"
    | "Exceptional Unique Amazon Bows"
    | "Elite Unique Amazon Bows"
    | "Exceptional Unique Amazon Javelins"
    | "Elite Unique Amazon Javelins"
    | "Exceptional Unique Assassin Katars"
    | "Elite Unique Assassin Katars"
    | "Exceptional Unique Barbarian Helmets"
    | "Elite Unique Barbarian Helmets"
    | "Exceptional Unique Druid Pelts"
    | "Elite Unique Druid Pelts"
    | "Exceptional Unique Necromancer Shrunken Heads"
    | "Elite Unique Necromancer Shrunken Heads"
    | "Exceptional Unique Paladin Shields"
    | "Elite Unique Paladin Shields"
    | "Exceptional Unique Sorceress Orbs"
    | "Elite Unique Sorceress Orbs"
    | "Unique Charms"
    | "Unique Jewels";

type SetCategory =
    | "Angelic Raiment"
    | "Arcanna's Tricks"
    | "Arctic Gear"
    | "Berserker's Arsenal"
    | "Cathan's Traps"
    | "Civerb's Vestments"
    | "Cleglaw's Brace"
    | "Death's Disguise"
    | "Hsarus' Defense"
    | "Infernal Tools"
    | "Iratha's Finery"
    | "Isenhart's Armory"
    | "Milabrega's Regalia"
    | "Sigon's Complete Steel"
    | "Tancred's Battlegear"
    | "Vidala's Rig"
    | "Cow King's Leathers"
    | "Aldur's Watchtower"
    | "Bul-Kathos' Children"
    | "The Disciple"
    | "Griswold's Legacy"
    | "Heaven's Brethren"
    | "Hwanin's Majesty"
    | "Immortal King"
    | "M'avina's Battle Hymn"
    | "Naj's Ancient Vestige"
    | "Natalya's Odium"
    | "Orphan's Call"
    | "Sander's Folly"
    | "Sazabi's Grand Tribute"
    | "Tal Rasha's Wrappings"
    | "Trang-Oul's Avatar";

// Label, Min value, Max value
type ItemProp = [string, ...string[]];
// type ItemProp = string | { description: string; props: string[] };

interface BaseItem {
    name: string;
    implicits?: ItemProp[];
    affixes: ItemProp[];
}

export interface UniqueItem extends BaseItem {
    type: string;
    image: string;
    category: UniqueCategory;
}

export interface SetItem extends BaseItem {
    type: string;
    image: string;
    category: SetCategory;
    itemBonuses: Record<number | string, ItemProp>;
    setBonuses: ItemProp[];
    setItems: string[];
}

export interface Runeword extends BaseItem {
    runes: string[];
    types: string[];
    detailTypes: string[];
    sockets: number;
}

export type Items = {
    uniqueItems: Record<string, UniqueItem>;
    setItems: Record<string, SetItem>;
    runewords: Record<string, Runeword>;
};
