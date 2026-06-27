import { AlertCircleIcon } from "lucide-react"

import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"

interface ValidationErrorProps {
    title?: string
    description?: string
}

export function ValidationError({ title, description }: ValidationErrorProps) {
    return (
        <Alert className="w-full border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-50">
            <AlertCircleIcon className="text-red-600 dark:text-red-400" />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>
                {description}
            </AlertDescription>
        </Alert>
    )
}
