import { IUser } from '../models/User.model';
import { User } from '../types/interfaces/User.interface';

const userMapper = (userModel: IUser) => {
  return {
    username: userModel.name,
    name: userModel.name,
    email: userModel.name,
    role: userModel.name,
  } as User;
};

export { userMapper };
