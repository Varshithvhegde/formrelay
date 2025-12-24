'use client'

import { Button } from '@/components/ui/Button'
import { RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function RefreshButton() {
    const router = useRouter()
    const [isRefreshing, setIsRefreshing] = useState(false)

    const handleRefresh = () => {
        setIsRefreshing(true)
        router.refresh()

        // Reset state after a short delay since router.refresh is async but doesn't return a promise
        setTimeout(() => {
            setIsRefreshing(false)
        }, 500)
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Refresh list"
        >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
        </Button>
    )
}
