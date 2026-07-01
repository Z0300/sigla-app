import { useState } from 'react'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { cn } from '#/utils/cn'

interface DatePickerProps {
    id?: string
    value: string
    onChange: (val: string) => void
    onBlur?: () => void
    min?: string
    max?: string
    placeholder?: string
    disabled?: boolean
}

export function DateTimePicker({
    id,
    value,
    onChange,
    onBlur,
    min,
    max,
    disabled,
}: DatePickerProps) {
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

    return (
        <div className="w-full">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id={id}
                        variant="outline"
                        disabled={disabled}
                        onBlur={onBlur}
                        className={cn(
                            'w-full justify-start text-left font-normal',
                            !datePart && 'text-muted-foreground'
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                        {datePart
                            ? format(new Date(datePart + 'T00:00'), 'MMM d, yyyy')
                            : 'Select date'}
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
        </div>
    )
}