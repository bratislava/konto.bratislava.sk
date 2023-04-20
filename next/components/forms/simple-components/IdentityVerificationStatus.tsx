import SuccessIcon from '@assets/images/new-icons/ui/check-mark.svg'
import WarningIcon from '@assets/images/new-icons/ui/exclamation-mark-triangle.svg'
import useAccount, { AccountStatus } from '@utils/useAccount'
import Link from 'next/link'

const IdentityVerificationStatus = () => {
  const { status } = useAccount()
  return status === AccountStatus.IdentityVerificationSuccess ? (
    <>
      {/* Desktop success */}
      <div className="hidden lg:flex gap-2 items-center px-2 py-1.5 pr-[10px] bg-success-100 rounded-full">
        <SuccessIcon className="w-6 h-6 text-success-700" />
        <span className="text-p3-medium text-success-700">Overený profil</span>
      </div>
      {/* Mobile success */}
      <div className="flex lg:hidden px-2 bg-success-100 rounded">
        <span className="text-p3-medium text-success-700">Overený profil</span>
      </div>
    </>
  ) : (
    <>
      {/* Desktop warning */}
      <div className="hidden lg:flex items-center gap-1.5 px-2 py-1.5 pr-4 border border-gray-200 rounded-full">
        <div className="flex gap-2 items-center px-2 py-1.5 pr-[10px] bg-warning-100 rounded-full">
          <WarningIcon className="w-5 h-5 text-warning-700" />
          <span className="text-p3-medium text-warning-700">Neoverený profil</span>
        </div>
        <Link href="/overenie-identity" className="text-p2-semibold py-1 px-2">
          Overiť identitu
        </Link>
      </div>
      {/* Mobile warning */}
      <div className="flex lg:hidden px-2 bg-warning-100 rounded">
        <span className="text-p3-medium text-warning-700">Neoverený profil</span>
      </div>
    </>
  )
}

export default IdentityVerificationStatus
