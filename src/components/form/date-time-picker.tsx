import { useState } from 'react'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { cn } from '#/utils/cn'

interface DateTimePickerProps {
    value: string
    onChange: (val: string) => void
    onBlur?: () => void
    min?: string
    max?: string
    placeholder?: string
    disabled?: boolean
}

export function DateTimePicker({
    value,
    onChange,
    onBlur,
    min,
    max,
    placeholder = 'Pick date & time',
    disabled,
}: DateTimePickerProps) {
    const [open, setOpen] = useState(false)

    const datePart = value?.slice(0, 10) ?? ''
    const timePart = value?.slice(11, 16) ?? ''

    const selectedDate = datePart ? new Date(datePart + 'T00:00') : undefined
    const minDate = min ? new Date(min.slice(0, 10) + 'T00:00') : undefined
    const maxDate = max ? new Date(max.slice(0, 10) + 'T00:00') : undefined

    function handleDaySelect(day: Date | undefined) {
        if (!day) return
        const d = format(day, 'yyyy-MM-dd')
        const t = timePart || '00:00'
        onChange(`${d}T${t}`)
        setOpen(false)
    }

    function handleTimeChange(e: React.ChangeEvent<HTMLInputElement>) {
        const t = e.target.value
        const d = datePart || format(new Date(), 'yyyy-MM-dd')
        onChange(`${d}T${t}`)
    }

    return (
        <div className="flex gap-2 items-center">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        disabled={disabled}
                        onBlur={onBlur}
                        className={cn(
                            'flex-1 justify-start text-left font-normal',
                            !datePart && 'text-muted-foreground'
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                        {datePart
                            ? format(new Date(datePart + 'T00:00'), 'MMM d, yyyy')
                            : 'Pick date'}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDaySelect}
                        disabled={(d) =>
                            (minDate ? d < minDate : false) ||
                            (maxDate ? d > maxDate : false)
                        }
                    />
                </PopoverContent>
            </Popover>

            <div className="flex flex-col gap-1">
                <Input
                    type="time"
                    value={timePart}
                    onChange={handleTimeChange}
                    onBlur={onBlur}
                    disabled={disabled || !datePart}
                    className="w-28 shrink-0"
                />
            </div>
        </div>
    )
}