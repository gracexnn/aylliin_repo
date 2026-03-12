'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Globe,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Facebook,
  Instagram,
  Linkedin,
  Megaphone,
  FileText,
  Search,
  Save,
  Loader2,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';
import { LandingSettingsSchema } from '@/schemas';

type SettingsForm = {
  hero_title: string;
  hero_subtitle: string;
  hero_primary_cta_text: string;
  hero_primary_cta_url: string;
  hero_secondary_cta_text: string;
  hero_secondary_cta_url: string;
  // Hero highlight cards
  highlight_1_title: string;
  highlight_1_description: string;
  highlight_2_title: string;
  highlight_2_description: string;
  highlight_3_title: string;
  highlight_3_description: string;
  // Why it works
  why_label: string;
  why_heading: string;
  why_body: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  contact_whatsapp: string;
  facebook_url: string;
  instagram_url: string;
  linkedin_url: string;
  announcement_text: string;
  footer_blurb: string;
  meta_title: string;
  meta_description: string;
  og_image_url: string;
};

const emptyForm: SettingsForm = {
  hero_title: '',
  hero_subtitle: '',
  hero_primary_cta_text: '',
  hero_primary_cta_url: '',
  hero_secondary_cta_text: '',
  hero_secondary_cta_url: '',
  highlight_1_title: '',
  highlight_1_description: '',
  highlight_2_title: '',
  highlight_2_description: '',
  highlight_3_title: '',
  highlight_3_description: '',
  why_label: '',
  why_heading: '',
  why_body: '',
  contact_email: '',
  contact_phone: '',
  contact_address: '',
  contact_whatsapp: '',
  facebook_url: '',
  instagram_url: '',
  linkedin_url: '',
  announcement_text: '',
  footer_blurb: '',
  meta_title: '',
  meta_description: '',
  og_image_url: '',
};

function toFormValues(raw: Record<string, unknown>): SettingsForm {
  return Object.fromEntries(
    Object.keys(emptyForm).map((k) => [k, (raw[k] as string | null) ?? '']),
  ) as SettingsForm;
}

type FieldErrors = Partial<Record<keyof SettingsForm, string>>;

function FieldGroup({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription className="text-xs mt-0.5">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-5 space-y-5">{children}</CardContent>
    </Card>
  );
}

export default function LandingSettingsPage() {
  const { toast } = useToast();
  const [form, setForm] = useState<SettingsForm>(emptyForm);
  const [initialForm, setInitialForm] = useState<SettingsForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/landing-settings');
        if (res.ok) {
          const data = await res.json();
          const values = toFormValues(data);
          setForm(values);
          setInitialForm(values);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const set = (key: keyof SettingsForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    try {
      LandingSettingsSchema.parse(
        Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v === '' ? null : v])),
      );
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: FieldErrors = {};
        for (const issue of err.issues) {
          const key = issue.path[0] as keyof SettingsForm;
          if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
        }
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSave = async () => {
    if (!validate()) {
      toast({ title: 'Талбаруудыг шалгана уу', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const payload = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, v === '' ? null : v]),
      );
      const res = await fetch('/api/admin/landing-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (res.status === 422 && body.details) {
          const fieldErrors: FieldErrors = {};
          for (const [k, msgs] of Object.entries(body.details as Record<string, string[]>)) {
            fieldErrors[k as keyof SettingsForm] = (msgs as string[])[0];
          }
          setErrors(fieldErrors);
          toast({ title: 'Баталгаажуулалтын алдаа', variant: 'destructive' });
        } else {
          toast({ title: body.error ?? 'Хадгалахад алдаа гарлаа', variant: 'destructive' });
        }
        return;
      }

      const saved = await res.json();
      const savedValues = toFormValues(saved);
      setForm(savedValues);
      setInitialForm(savedValues);
      setSavedAt(new Date());
      toast({ title: 'Тохиргоо хадгалагдлаа ✓' });
    } catch {
      toast({ title: 'Сервертэй холбогдож чадсангүй', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setErrors({});
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Нүүр хуудасны тохиргоо</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Нийтийн нүүр хуудасны гарчиг, холбоо барих болон SEO тохиргоог энд засна.
          </p>
          {savedAt && (
            <p className="text-xs text-muted-foreground mt-1">
              Сүүлд хадгалсан: {savedAt.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={handleReset} title="Reset form">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button onClick={handleSave} disabled={saving} size="sm">
            {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
            Хадгалах
          </Button>
        </div>
      </div>

      {/* ── Hero ───────────────────────────────── */}
      <SectionCard icon={Globe} title="Hero хэсэг" description="Нүүр хуудасны дээд хэсгийн гарчиг, тайлбар, товч">
        <FieldGroup id="hero_title" label="Үндсэн гарчиг" error={errors.hero_title}>
          <Textarea
            id="hero_title"
            rows={2}
            value={form.hero_title}
            onChange={set('hero_title')}
            placeholder="Аяллаа зүгээр төлөвлөх биш, утга учиртай эхлүүл."
            className={errors.hero_title ? 'border-destructive' : ''}
          />
        </FieldGroup>
        <FieldGroup id="hero_subtitle" label="Дэд гарчиг / тайлбар" error={errors.hero_subtitle}>
          <Textarea
            id="hero_subtitle"
            rows={3}
            value={form.hero_subtitle}
            onChange={set('hero_subtitle')}
            placeholder="Платформын богино тайлбар..."
            className={errors.hero_subtitle ? 'border-destructive' : ''}
          />
        </FieldGroup>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FieldGroup id="hero_primary_cta_text" label="Үндсэн товч текст" error={errors.hero_primary_cta_text}>
            <Input
              id="hero_primary_cta_text"
              value={form.hero_primary_cta_text}
              onChange={set('hero_primary_cta_text')}
              placeholder="Багцууд үзэх"
              className={errors.hero_primary_cta_text ? 'border-destructive' : ''}
            />
          </FieldGroup>
          <FieldGroup id="hero_primary_cta_url" label="Үндсэн товч холбоос" error={errors.hero_primary_cta_url}
            hint="/guides эсвэл https://...">
            <Input
              id="hero_primary_cta_url"
              value={form.hero_primary_cta_url}
              onChange={set('hero_primary_cta_url')}
              placeholder="/guides"
              className={errors.hero_primary_cta_url ? 'border-destructive' : ''}
            />
          </FieldGroup>
          <FieldGroup id="hero_secondary_cta_text" label="Хоёрдогч товч текст" error={errors.hero_secondary_cta_text}>
            <Input
              id="hero_secondary_cta_text"
              value={form.hero_secondary_cta_text}
              onChange={set('hero_secondary_cta_text')}
              placeholder="Онцлох чиглэл үзэх"
              className={errors.hero_secondary_cta_text ? 'border-destructive' : ''}
            />
          </FieldGroup>
          <FieldGroup id="hero_secondary_cta_url" label="Хоёрдогч товч холбоос" error={errors.hero_secondary_cta_url}>
            <Input
              id="hero_secondary_cta_url"
              value={form.hero_secondary_cta_url}
              onChange={set('hero_secondary_cta_url')}
              placeholder="#guides"
              className={errors.hero_secondary_cta_url ? 'border-destructive' : ''}
            />
          </FieldGroup>
        </div>
      </SectionCard>
      {/* ── Hero highlight cards ───────────────── */}
      <SectionCard icon={Sparkles} title="Hero highlight карт" description="Hero дор харагдах 3 давуу талын карт">
        {/* Card 1 */}
        <div className="rounded-lg border p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">1-р карт</p>
          <FieldGroup id="highlight_1_title" label="Гарчиг" error={errors.highlight_1_title}>
            <Input
              id="highlight_1_title"
              value={form.highlight_1_title}
              onChange={set('highlight_1_title')}
              placeholder="Тодорхой маршрут"
              className={errors.highlight_1_title ? 'border-destructive' : ''}
            />
          </FieldGroup>
          <FieldGroup id="highlight_1_description" label="Тайлбар" error={errors.highlight_1_description}>
            <Textarea
              id="highlight_1_description"
              rows={2}
              value={form.highlight_1_description}
              onChange={set('highlight_1_description')}
              placeholder="Өдөр, байршил, шилжилт бүрийг эмх цэгцтэй дарааллаар харуулна."
              className={errors.highlight_1_description ? 'border-destructive' : ''}
            />
          </FieldGroup>
        </div>
        {/* Card 2 */}
        <div className="rounded-lg border p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">2-р карт</p>
          <FieldGroup id="highlight_2_title" label="Гарчиг" error={errors.highlight_2_title}>
            <Input
              id="highlight_2_title"
              value={form.highlight_2_title}
              onChange={set('highlight_2_title')}
              placeholder="Орон нутгийн өнгө аяс"
              className={errors.highlight_2_title ? 'border-destructive' : ''}
            />
          </FieldGroup>
          <FieldGroup id="highlight_2_description" label="Тайлбар" error={errors.highlight_2_description}>
            <Textarea
              id="highlight_2_description"
              rows={2}
              value={form.highlight_2_description}
              onChange={set('highlight_2_description')}
              placeholder="Түгээмэл цэгүүдээс цааш тухайн газрын онцгой мэдрэмжийг мэдрүүлнэ."
              className={errors.highlight_2_description ? 'border-destructive' : ''}
            />
          </FieldGroup>
        </div>
        {/* Card 3 */}
        <div className="rounded-lg border p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">3-р карт</p>
          <FieldGroup id="highlight_3_title" label="Гарчиг" error={errors.highlight_3_title}>
            <Input
              id="highlight_3_title"
              value={form.highlight_3_title}
              onChange={set('highlight_3_title')}
              placeholder="Ухаалаг төлөвлөлт"
              className={errors.highlight_3_title ? 'border-destructive' : ''}
            />
          </FieldGroup>
          <FieldGroup id="highlight_3_description" label="Тайлбар" error={errors.highlight_3_description}>
            <Textarea
              id="highlight_3_description"
              rows={2}
              value={form.highlight_3_description}
              onChange={set('highlight_3_description')}
              placeholder="Хэзээ очих, хаанаас эхлэх, юуг заавал үзэхийг нэг дороос."
              className={errors.highlight_3_description ? 'border-destructive' : ''}
            />
          </FieldGroup>
        </div>
      </SectionCard>

      {/* ── Why it works ───────────────────── */}
      <SectionCard icon={Zap} title={'"Why it works" хэсэг'} description="Hero доорх статистик хэсгийн зүүн талын текст">
        <FieldGroup id="why_label" label="Дэд шошиво (жижиг тодорхой)" error={errors.why_label}>
          <Input
            id="why_label"
            value={form.why_label}
            onChange={set('why_label')}
            placeholder="Why it works"
            className={errors.why_label ? 'border-destructive' : ''}
          />
        </FieldGroup>
        <FieldGroup id="why_heading" label="Томоохой гарчиг" error={errors.why_heading}>
          <Textarea
            id="why_heading"
            rows={2}
            value={form.why_heading}
            onChange={set('why_heading')}
            placeholder="Хүмүүс эндээс зөвхөн санаа биш, шийдвэр гаргах тодорхой байдал авдаг."
            className={errors.why_heading ? 'border-destructive' : ''}
          />
        </FieldGroup>
        <FieldGroup id="why_body" label="Тайлбар параграф" error={errors.why_body}>
          <Textarea
            id="why_body"
            rows={3}
            value={form.why_body}
            onChange={set('why_body')}
            placeholder="Хэт ерөнхий зөвлөгөө биш — маршрут, цагийн хуваарь..."
            className={errors.why_body ? 'border-destructive' : ''}
          />
        </FieldGroup>
      </SectionCard>
      {/* ── Contact ─────────────────────────────── */}
      <SectionCard icon={Phone} title="Холбоо барих мэдээлэл" description="Имэйл, утас, хаяг, WhatsApp">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FieldGroup id="contact_email" label="Имэйл" error={errors.contact_email}>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="contact_email"
                type="email"
                value={form.contact_email}
                onChange={set('contact_email')}
                placeholder="info@aylal.mn"
                className={`pl-9 ${errors.contact_email ? 'border-destructive' : ''}`}
              />
            </div>
          </FieldGroup>
          <FieldGroup id="contact_phone" label="Утасны дугаар" error={errors.contact_phone}>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="contact_phone"
                value={form.contact_phone}
                onChange={set('contact_phone')}
                placeholder="+976 9900 0000"
                className={`pl-9 ${errors.contact_phone ? 'border-destructive' : ''}`}
              />
            </div>
          </FieldGroup>
          <FieldGroup id="contact_whatsapp" label="WhatsApp дугаар" error={errors.contact_whatsapp}
            hint="Олон улсын формат: +976...">
            <div className="relative">
              <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="contact_whatsapp"
                value={form.contact_whatsapp}
                onChange={set('contact_whatsapp')}
                placeholder="+97699000000"
                className={`pl-9 ${errors.contact_whatsapp ? 'border-destructive' : ''}`}
              />
            </div>
          </FieldGroup>
          <FieldGroup id="contact_address" label="Хаяг" error={errors.contact_address}>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="contact_address"
                value={form.contact_address}
                onChange={set('contact_address')}
                placeholder="Улаанбаатар, Монгол"
                className={`pl-9 ${errors.contact_address ? 'border-destructive' : ''}`}
              />
            </div>
          </FieldGroup>
        </div>
      </SectionCard>

      {/* ── Social ──────────────────────────────── */}
      <SectionCard icon={Globe} title="Сошиал холбоосууд" description="Facebook, Instagram, LinkedIn хаягуудыг оруулна">
        <div className="space-y-4">
          <FieldGroup id="facebook_url" label="Facebook URL" error={errors.facebook_url}>
            <div className="relative">
              <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="facebook_url"
                value={form.facebook_url}
                onChange={set('facebook_url')}
                placeholder="https://facebook.com/aylal"
                className={`pl-9 ${errors.facebook_url ? 'border-destructive' : ''}`}
              />
            </div>
          </FieldGroup>
          <FieldGroup id="instagram_url" label="Instagram URL" error={errors.instagram_url}>
            <div className="relative">
              <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="instagram_url"
                value={form.instagram_url}
                onChange={set('instagram_url')}
                placeholder="https://instagram.com/aylal"
                className={`pl-9 ${errors.instagram_url ? 'border-destructive' : ''}`}
              />
            </div>
          </FieldGroup>
          <FieldGroup id="linkedin_url" label="LinkedIn URL" error={errors.linkedin_url}>
            <div className="relative">
              <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="linkedin_url"
                value={form.linkedin_url}
                onChange={set('linkedin_url')}
                placeholder="https://linkedin.com/company/aylal"
                className={`pl-9 ${errors.linkedin_url ? 'border-destructive' : ''}`}
              />
            </div>
          </FieldGroup>
        </div>
      </SectionCard>

      {/* ── Footer & Announcement ──────────────── */}
      <SectionCard icon={FileText} title="Footer ба Зарлал" description="Footer тайлбар ба дээд хэсгийн зарлал">
        <FieldGroup id="announcement_text" label="Зарлалын мессеж" error={errors.announcement_text}
          hint="Хоосон орхивол зарлал харагдахгүй.">
          <div className="relative">
            <Megaphone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Textarea
              id="announcement_text"
              rows={2}
              value={form.announcement_text}
              onChange={set('announcement_text')}
              placeholder="Шинэ аяллын хөтөлбөр нэмэгдлээ! Дэлгэрэнгүйг үзнэ үү."
              className={`pl-10 ${errors.announcement_text ? 'border-destructive' : ''}`}
            />
          </div>
        </FieldGroup>
        <FieldGroup id="footer_blurb" label="Footer богино тайлбар" error={errors.footer_blurb}>
          <Textarea
            id="footer_blurb"
            rows={2}
            value={form.footer_blurb}
            onChange={set('footer_blurb')}
            placeholder="Дэлгэрэнгүй маршрут, орон нутгийн зөвлөгөөтэй аяллын багцуудыг танд хүргэнэ."
            className={errors.footer_blurb ? 'border-destructive' : ''}
          />
        </FieldGroup>
      </SectionCard>

      {/* ── SEO ─────────────────────────────────── */}
      <SectionCard icon={Search} title="SEO тохиргоо" description="Нүүр хуудасны мета гарчиг, тайлбар, OG зураг">
        <FieldGroup id="meta_title" label="Meta Title" error={errors.meta_title}
          hint="Хэрэв хоосон бол өгөгдмөл нэр ашиглана.">
          <Input
            id="meta_title"
            value={form.meta_title}
            onChange={set('meta_title')}
            placeholder="Aylal — Аяллын багц"
            className={errors.meta_title ? 'border-destructive' : ''}
          />
        </FieldGroup>
        <FieldGroup id="meta_description" label="Meta Description" error={errors.meta_description}>
          <Textarea
            id="meta_description"
            rows={2}
            value={form.meta_description}
            onChange={set('meta_description')}
            placeholder="Дэлгэрэнгүй маршрут, орон нутгийн зөвлөгөө, хэрэгтэй мэдээлэл..."
            className={errors.meta_description ? 'border-destructive' : ''}
          />
        </FieldGroup>
        <FieldGroup id="og_image_url" label="OG зургийн URL" error={errors.og_image_url}
          hint="https:// -аар эхэлсэн бүрэн URL">
          <Input
            id="og_image_url"
            value={form.og_image_url}
            onChange={set('og_image_url')}
            placeholder="https://cdn.aylal.mn/og-image.jpg"
            className={errors.og_image_url ? 'border-destructive' : ''}
          />
        </FieldGroup>
      </SectionCard>

      {/* Sticky save bar */}
      <div className="sticky bottom-4 flex justify-end">
        <div className="rounded-xl border bg-card shadow-lg px-4 py-3 flex items-center gap-3">
          {Object.keys(errors).length > 0 && (
            <p className="text-xs text-destructive">
              {Object.keys(errors).length} талбарт алдаа байна
            </p>
          )}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
            Тохиргоо хадгалах
          </Button>
        </div>
      </div>
    </div>
  );
}
