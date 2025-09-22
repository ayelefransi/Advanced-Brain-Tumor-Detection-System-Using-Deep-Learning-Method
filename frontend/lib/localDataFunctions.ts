import { localData, User, Patient, Scan } from './localData';
import { v4 as uuidv4 } from 'uuid'; // You'll need to install this package

export const findUniqueUser = (email: string) => {
  return localData.users.find(user => user.email === email);
};

export const createUser = (userData: Partial<User>) => {
  const newUser: User = {
    id: uuidv4(),
    email: userData.email!,
    name: userData.name,
    image: userData.image,
    role: userData.role || 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  localData.users.push(newUser);
  return newUser;
};

// Add more functions as needed for your application 