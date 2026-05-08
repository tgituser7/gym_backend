import { Types } from 'mongoose';
export interface IGym {
    _id: Types.ObjectId;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    website?: string;
    description?: string;
    logo?: string;
    status: 'active' | 'inactive' | 'suspended';
    createdAt: Date;
    updatedAt: Date;
}
export interface IBranch {
    _id: Types.ObjectId;
    gym: Types.ObjectId;
    name: string;
    email: string;
    password: string;
    address?: string;
    city?: string;
    state?: string;
    phone?: string;
    openingHours?: string;
    manager?: Types.ObjectId;
    status: 'active' | 'inactive';
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface IStaff {
    _id: Types.ObjectId;
    branch: Types.ObjectId;
    name: string;
    email: string;
    phone?: string;
    role: 'Trainer' | 'Instructor' | 'Manager' | 'Receptionist' | 'Maintenance' | 'Nutritionist' | 'Other';
    specialization?: string;
    salary?: number;
    joinDate: Date;
    status: 'active' | 'inactive';
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface IService {
    _id: Types.ObjectId;
    branch: Types.ObjectId;
    name: string;
    description?: string;
    price: number;
    duration?: number;
    instructor?: Types.ObjectId;
    category: 'Yoga' | 'Cardio' | 'Strength' | 'Pilates' | 'Swimming' | 'Martial Arts' | 'Dance' | 'Nutrition' | 'Other';
    schedule?: string;
    maxCapacity?: number;
    status: 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
}
export interface IMember {
    _id: Types.ObjectId;
    branch: Types.ObjectId;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    dateOfBirth?: Date;
    gender?: 'male' | 'female' | 'other';
    membershipStartDate: Date;
    membershipEndDate?: Date;
    services: Types.ObjectId[];
    status: 'active' | 'inactive';
    emergencyContact?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface IFee {
    _id: Types.ObjectId;
    branch: Types.ObjectId;
    member: Types.ObjectId;
    amount: number;
    description?: string;
    dueDate: Date;
    paymentDate?: Date;
    status: 'paid' | 'pending' | 'overdue';
    paymentMethod?: 'cash' | 'card' | 'online' | 'other';
    services: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=index.d.ts.map