import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Label } from '@/components/ui/Label'
import { FormActions } from '@/components/dashboard/FormActions'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ArrowLeft } from 'lucide-react'

// Submissions Table component
function SubmissionsTable({ submissions }: { submissions: any[] }) {
    if (!submissions || submissions.length === 0) {
        return <div className="text-gray-500 py-4 text-center">No submissions yet.</div>
    }
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payload</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {submissions.map((sub) => (
                        <tr key={sub.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top">
                                {new Date(sub.created_at).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 align-top">
                                <pre className="whitespace-pre-wrap font-mono text-xs max-w-lg bg-gray-50 p-2 rounded">
                                    {JSON.stringify(sub.payload, null, 2)}
                                </pre>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default async function FormDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: form } = await supabase
        .from('forms')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (!form) {
        notFound()
    }

    // Fetch submissions (limit 50 mostly)
    const { data: submissions } = await supabase
        .from('submissions')
        .select('*')
        .eq('form_id', id)
        .order('created_at', { ascending: false })
        .limit(50)

    const endpointUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/submit`

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/dashboard/forms">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back
                    </Button>
                </Link>
                <div className="flex-1 flex items-center space-x-3">
                    <h1 className="text-2xl font-semibold text-gray-900">{form.name}</h1>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${form.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {form.is_active ? 'Active' : 'Inactive'}
                    </span>
                </div>
                <FormActions formId={form.id} isActive={form.is_active} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Integration Guide</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <Label className="text-gray-500 uppercase text-xs tracking-wider">1. API Endpoint</Label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <div className="relative flex-grow focus-within:z-10">
                                        <div className="block w-full rounded-md border-gray-300 bg-gray-50 pl-3 pr-12 py-2 sm:text-sm font-mono border">
                                            {endpointUrl}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label className="text-gray-500 uppercase text-xs tracking-wider">2. Form ID (Must be included in body)</Label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <div className="relative flex-grow focus-within:z-10">
                                        <div className="block w-full rounded-md border-gray-300 bg-gray-50 pl-3 pr-12 py-2 sm:text-sm font-mono border">
                                            {form.id}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label className="text-gray-500 uppercase text-xs tracking-wider">3. Example Usage (JavaScript)</Label>
                                <div className="mt-2 bg-gray-900 rounded-md p-4 overflow-x-auto">
                                    <pre className="text-sm font-mono text-gray-300">
                                        {`const submitForm = async (data) => {
  await fetch('${endpointUrl}', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      form_id: '${form.id}',
      ...data
    }),
  })
}`}
                                    </pre>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Submissions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <SubmissionsTable submissions={submissions || []} />
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Settings Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Notification Email</Label>
                                <p className="text-sm text-gray-900 font-medium">{form.notification_email}</p>
                            </div>
                            <div>
                                <Label>Allowed Domains</Label>
                                {form.allowed_domains && form.allowed_domains.length > 0 ? (
                                    <ul className="mt-1 list-disc list-inside text-sm text-gray-700 bg-gray-50 p-2 rounded-md border border-gray-200">
                                        {form.allowed_domains.map((d: string) => <li key={d}>{d}</li>)}
                                    </ul>
                                ) : (
                                    <p className="mt-1 text-sm text-gray-500 italic bg-yellow-50 p-2 rounded-md border border-yellow-200">All domains allowed (public).</p>
                                )}
                            </div>
                            <div className="pt-4 border-t border-gray-100">
                                <Label>Created on</Label>
                                <p className="text-sm text-gray-500">{new Date(form.created_at).toLocaleDateString()}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
