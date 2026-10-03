# Decisions
- The public site uses a polished local fallback dataset when Supabase environment variables are absent, so an empty local checkout remains visually reviewable; configured Supabase published content replaces it.
- RLS permits any authenticated user to administer a single student deployment. For a multi-user shared project, replace this with an explicit owner/profile role check.
- Images are represented by CSS/SVG-ready placeholders rather than remote hosts, avoiding external asset dependencies.
- Migration SQL is the source of truth for provisioning because no Supabase project credentials/integration were available to this runtime.
