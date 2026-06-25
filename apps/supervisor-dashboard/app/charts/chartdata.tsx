import { getResidents } from "@/lib/api";
import { get } from "node:http";

const data = await getResidents();
const response = data?.residents || [];

const wards = response.map((item: any) => item.ward_name && item.ward_no ? `${item.ward_no} - ${item.ward_name}` : 'Unknown Ward');
const uniqueWards = Array.from(new Set(wards));
export const wardno = uniqueWards;

const resident = response.map((item: any) => item.ward_name&& item.ward_no ? `${item.ward_no} - ${item.ward_name}` : 'Unknown Ward');
const residentsCount = Array.from(new Set(resident)).map(ward => {
    return resident.filter((r: any) => r === ward).length;
});
export const residents = residentsCount;

