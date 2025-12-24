import { CreateForm } from '@/components/dashboard/CreateForm'

export default function NewFormPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-gray-900">Create New Form</h1>
            <CreateForm />
        </div>
    )
}
