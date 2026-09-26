import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/admin/project-form";
import { getProjectById } from "@/lib/data";
import { updateProject } from "../../actions";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  // .bind фиксирует id первым аргументом — ProjectForm вызывает результат
  // как обычный (formData) => Promise<...>, ничего не зная про id
  const boundUpdate = updateProject.bind(null, id);

  return <ProjectForm initialData={project} action={boundUpdate} />;
}
