import { CreateForm } from '@/components/dashboard/CreateForm'

export default function NewFormPage() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Create New Form</h1>
            <CreateForm />
        </div>
    )
}
