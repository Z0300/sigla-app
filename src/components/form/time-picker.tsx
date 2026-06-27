import { Input } from '@/components/ui/input'
import { cn } from '#/utils/cn'

interface TimePickerProps {
    value: string
    onChange: (val: string) => void
    onBlur?: () => void
    disabled?: boolean
    className?: string
}

export function TimePicker({
    value,
    onChange,
    onBlur,
    disabled,
    className,
}: TimePickerProps) {
    return (
        <Input
            type="time"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            disabled={disabled}
            className={cn('w-full', className)}
        />
    )
}
