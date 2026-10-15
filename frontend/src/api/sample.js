import { endpoints } from './client';

const SAMPLE = [
  {
    name: 'Pizza Palace',
    cuisine: 'Italian',
    address: '45 MG Road',
    items: [
      ['Margherita Pizza', 'Classic tomato, mozzarella and fresh basil', 250, true],
      ['Pepperoni Pizza', 'Spicy pepperoni on a crisp thin crust', 320, false],
      ['Garlic Bread', 'Toasted with herb butter', 90, true],
      ['Penne Arrabbiata', 'Penne in a fiery tomato sauce', 210, true],
    ],
  },
  {
    name: 'Spice Route',
    cuisine: 'Indian',
    address: '12 Temple Street',
    items: [
      ['Paneer Butter Masala', 'Creamy tomato gravy with soft paneer', 240, true],
      ['Chicken Biryani', 'Slow-cooked basmati with tender chicken', 290, false],
      ['Butter Naan', 'Fresh from the tandoor', 45, true],
      ['Mango Lassi', 'Chilled and thick', 80, true],
    ],
  },
  {
    name: 'Dragon Bowl',
    cuisine: 'Chinese',
    address: '8 Lake View Road',
    items: [
      ['Veg Hakka Noodles', 'Wok-tossed with crunchy vegetables', 170, true],
      ['Chicken Manchurian', 'Crispy chicken in tangy sauce', 230, false],
      ['Veg Momos', 'Steamed dumplings with chilli dip', 120, true],
    ],
  },
  {
    name: 'Burger Barn',
    cuisine: 'American',
    address: '27 Market Square',
    items: [
      ['Classic Cheeseburger', 'Juicy patty, cheddar, house sauce', 180, false],
      ['Crispy Veg Burger', 'Golden patty with fresh lettuce', 150, true],
      ['Loaded Fries', 'Cheese sauce and jalapenos', 130, true],
      ['Chocolate Shake', 'Thick and creamy', 140, true],
    ],
  },
  {
    name: 'Dosa Corner',
    cuisine: 'South Indian',
    address: '3 Bazaar Lane',
    items: [
      ['Masala Dosa', 'Crisp dosa with spiced potato', 100, true],
      ['Idli Sambar', 'Soft idlis with sambar and chutney', 80, true],
      ['Filter Coffee', 'Strong and frothy', 40, true],
    ],
  },
];

/** Creates a handful of restaurants and menu items so a fresh database has something to browse. */
export async function seedSampleData(onProgress) {
  for (let i = 0; i < SAMPLE.length; i += 1) {
    const r = SAMPLE[i];
    onProgress?.(`Adding ${r.name}...`);
    const { data: created } = await endpoints.createRestaurant({
      name: r.name,
      cuisine: r.cuisine,
      address: r.address,
    });
    for (const [name, description, price, veg] of r.items) {
      // The backend's FoodItemRequest has a Lombok `boolean isVeg` field, which binds from the JSON key `veg`.
      await endpoints.addFoodItem(created.id, { name, description, price, veg, isVeg: veg });
    }
  }
}
