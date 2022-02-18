export interface SpecialsComponentProps {
    str: string;
    onChange: (newValue: string) => void;
}

export interface SpecialsComponentRef {
    executeFormatting: (str?: string) => void;
}
