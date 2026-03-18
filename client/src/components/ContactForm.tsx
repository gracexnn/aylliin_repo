'use client'

import { FormEvent, useState } from 'react'
import { FiCheckCircle, FiLoader, FiSend } from 'react-icons/fi'

type FormStatus = 'idle' | 'sending' | 'sent' | 'error'

type ContactResponse = {
    message?: string
}

export default function ContactForm() {
    const [status, setStatus] = useState<FormStatus>('idle')
    const [feedback, setFeedback] = useState('')

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const form = event.currentTarget
        const formData = new FormData(form)

        const payload = {
            name: String(formData.get('name') ?? '').trim(),
            email: String(formData.get('email') ?? '').trim(),
            phone: String(formData.get('phone') ?? '').trim(),
            travelInterest: String(formData.get('travelInterest') ?? '').trim(),
            message: String(formData.get('message') ?? '').trim(),
        }

        if (!payload.name || !payload.email || !payload.message) {
            setStatus('error')
            setFeedback('Нэр, и-мэйл, зурвас гэсэн талбаруудыг бөглөнө үү.')
            return
        }

        try {
            setStatus('sending')
            setFeedback('')

            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            const data = (await response.json()) as ContactResponse

            if (!response.ok) {
                throw new Error(data.message ?? 'Хүсэлт илгээх үед алдаа гарлаа.')
            }

            setStatus('sent')
            setFeedback(data.message ?? 'Таны хүсэлт амжилттай илгээгдлээ.')
            form.reset()
        } catch (error) {
            setStatus('error')
            setFeedback(
                error instanceof Error
                    ? error.message
                    : 'Хүсэлт илгээх үед алдаа гарлаа. Дахин оролдоно уу.',
            )
        }
    }

    return (
        <div className="rounded-3xl border border-primary-100 bg-white/90 p-6 shadow-xl backdrop-blur-sm sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900">Бидэнд зурвас илгээгээрэй</h2>
            <p className="mt-2 text-sm text-gray-600">
                Аяллын төрлөө бичээд илгээгээрэй. Манай баг аль болох хурдан холбогдоно.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                        <span className="mb-1.5 block text-sm font-medium text-gray-700">Нэр</span>
                        <input
                            type="text"
                            name="name"
                            required
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                            placeholder="Таны нэр"
                        />
                    </label>

                    <label className="block">
                        <span className="mb-1.5 block text-sm font-medium text-gray-700">И-мэйл</span>
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                            placeholder="name@email.com"
                        />
                    </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                        <span className="mb-1.5 block text-sm font-medium text-gray-700">Утас</span>
                        <input
                            type="tel"
                            name="phone"
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                            placeholder="+976 xxxx xxxx"
                        />
                    </label>

                    <label className="block">
                        <span className="mb-1.5 block text-sm font-medium text-gray-700">Аяллын сонирхол</span>
                        <input
                            type="text"
                            name="travelInterest"
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                            placeholder="Хотын аялал, байгаль, адал явдал..."
                        />
                    </label>
                </div>

                <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-gray-700">Зурвас</span>
                    <textarea
                        name="message"
                        required
                        rows={5}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                        placeholder="Аяллын хугацаа, хүний тоо, хүсэж буй чиглэлээ бичнэ үү."
                    />
                </label>

                <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {status === 'sending' ? (
                        <>
                            <FiLoader className="animate-spin" />
                            Илгээж байна...
                        </>
                    ) : (
                        <>
                            <FiSend />
                            Хүсэлт илгээх
                        </>
                    )}
                </button>
            </form>

            {feedback ? (
                <p
                    className={`mt-4 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${{
                        sent: 'border-emerald-200 bg-emerald-50 text-emerald-700',
                        error: 'border-red-200 bg-red-50 text-red-700',
                    }[status] ?? 'border-gray-200 bg-gray-50 text-gray-700'}`}
                >
                    {status === 'sent' ? <FiCheckCircle className="mt-0.5 shrink-0" /> : null}
                    <span>{feedback}</span>
                </p>
            ) : null}
        </div>
    )
}