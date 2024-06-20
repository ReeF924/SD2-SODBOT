
export function mapStringToEnum<T>(enumObj: T, str: string): T[keyof T] | undefined {

    const keys = Object.keys(enumObj).filter(key => isNaN(Number(key)));

    for (const key of keys) {
        if (key.toLowerCase() === str.toLowerCase()){
            return enumObj[key as keyof T];
        }
    }
    return undefined;
}