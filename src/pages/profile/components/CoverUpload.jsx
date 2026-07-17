import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { uploadToCloudinary } from '../../../utils/uploadToCloudinary'

// Обложка-баннер 3:1. Если url пуст — градиентный плейсхолдер.
// В edit-режиме внизу справа кнопка «Заменить».
export default function CoverUpload({ url, editable = false, onChange }) {
  const { t } = useTranslation('teacher')
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 8 * 1024 * 1024) {
      toast.error(t('profile.coverTooBig'))
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
      e.target.value = ''
    }
  }

  return (
    <div className="relative w-full h-40 sm:h-56 rounded-2xl overflow-hidden">
      {url
        ? <img src={url} alt="" className="w-full h-full object-cover" />
        : <div className="w-full h-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600" />
      }
      {/* Затемнение снизу — чтобы лучше читалось имя/аватар, наложенные сверху */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b1019]/80 to-transparent" />

      {editable && (
        <>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-xs font-medium cursor-pointer transition-colors disabled:cursor-not-allowed"
          >
            {uploading ? t('profile.uploading') : t('profile.changeCover')}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </>
      )}
    </div>
  )
}
