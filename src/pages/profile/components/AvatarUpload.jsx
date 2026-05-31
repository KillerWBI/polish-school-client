import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { uploadToCloudinary } from '../../../utils/uploadToCloudinary'

// Круглый аватар. В edit-режиме при клике открывает диалог выбора файла.
// При загрузке вызывает onChange(url) — родитель решает, сохранять локально или сразу слать на бэк.
export default function AvatarUpload({ url, name, editable = false, onChange, size = 120 }) {
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const initial = name?.[0]?.toUpperCase() ?? '?'

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Размер до 5 MB — экономия Cloudinary квоты, аватары больше и не нужны
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Файл больше 5 MB')
      return
    }
    setUploading(true)
    try {
      const secureUrl = await uploadToCloudinary(file)
      onChange(secureUrl)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setUploading(false)
      // Сброс input — иначе повторный выбор того же файла не сработает
      e.target.value = ''
    }
  }

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {/* Круг — аватар или инициал */}
      <div
        className="w-full h-full rounded-full bg-gradient-to-br from-brand-600 to-pink-accent border-4 border-[#0b1019] overflow-hidden flex items-center justify-center text-white font-semibold"
        style={{ fontSize: size / 2.5 }}
      >
        {url
          ? <img src={url} alt={name || ''} className="w-full h-full object-cover" />
          : initial
        }
      </div>

      {/* Кнопка-овэрлей в edit-режиме */}
      {editable && (
        <>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 rounded-full bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-xs font-medium transition-opacity cursor-pointer disabled:cursor-not-allowed"
          >
            {uploading ? 'Загрузка...' : '📷 Заменить'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
        </>
      )}
    </div>
  )
}
