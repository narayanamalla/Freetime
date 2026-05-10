import { redirect } from 'next/navigation'

export default async function WeeklyExamDetailPage({
  params,
}: {
  params: Promise<{ examId: string }>
}) {
  const { examId } = await params
  redirect(`/exams/${examId}`)
}
