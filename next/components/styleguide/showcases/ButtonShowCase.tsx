import { ArrowRightIcon, SearchIcon } from '@assets/ui-icons'

import Button from '../../forms/simple-components/Button'
import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const ButtonShowCase = () => {
  return (
    <Wrapper direction="column" title="Button">
      <Stack>
        <Button variant="category" icon={<SearchIcon className="fill-white" />} />
        <Button variant="category" icon={<SearchIcon />} size="sm" />
        <Button variant="category" text="Button" />
        <Button variant="category" text="Button" size="sm" />
        <Button variant="category" text="Button disabled" disabled />
        <Button variant="category" text="Button disabled" size="sm" disabled />
      </Stack>
      <Stack>
        <Button
          startIcon={<SearchIcon />}
          endIcon={<ArrowRightIcon className="h-6 w-6" />}
          variant="category"
          text="Button"
        />
        <Button
          startIcon={<SearchIcon />}
          endIcon={<ArrowRightIcon className="h-6 w-6" />}
          variant="category"
          text="Button"
          size="sm"
        />
        <Button variant="category" text="Button disabled" disabled />
        <Button variant="category" text="Button disabled" size="sm" disabled />
      </Stack>
      <Stack>
        <Button variant="category-outline" text="Button" />
        <Button variant="category-outline" text="Button" size="sm" />
        <Button variant="category-outline" text="Button disabled" disabled />
        <Button variant="category-outline" text="Button disabled" size="sm" disabled />
      </Stack>
      <Stack>
        <Button variant="category-outline" text="Button" startIcon={<SearchIcon />} />
        <Button
          variant="category-outline"
          text="Button"
          endIcon={<ArrowRightIcon className="h-6 w-6" />}
        />
        <Button
          variant="category-outline"
          text="Button"
          startIcon={<SearchIcon />}
          endIcon={<ArrowRightIcon className="h-6 w-6" />}
        />
        <Button variant="category-outline" text="Button" size="sm" startIcon={<SearchIcon />} />
        <Button
          variant="category-outline"
          text="Button"
          size="sm"
          endIcon={<ArrowRightIcon className="h-6 w-6" />}
        />
        <Button
          variant="category-outline"
          text="Button"
          size="sm"
          startIcon={<SearchIcon />}
          endIcon={<ArrowRightIcon className="h-6 w-6" />}
        />
      </Stack>
      <Stack>
        <Button variant="category-outline" icon={<SearchIcon />} />
        <Button variant="category-outline" icon={<SearchIcon />} size="sm" />
        <Button variant="category-outline" icon={<SearchIcon />} disabled />
        <Button variant="category-outline" icon={<SearchIcon />} size="sm" disabled />
      </Stack>

      <Stack>
        <Button text="Button" />
        <Button text="Button" size="sm" />
        <Button text="Button disabled" disabled />
        <Button text="Button disabled" size="sm" disabled />
      </Stack>
      <Stack>
        <Button text="Button" startIcon={<SearchIcon />} />
        <Button text="Button" endIcon={<ArrowRightIcon className="h-6 w-6" />} />
        <Button
          text="Button"
          startIcon={<SearchIcon />}
          endIcon={<ArrowRightIcon className="h-6 w-6" />}
        />
        <Button text="Button" size="sm" startIcon={<SearchIcon />} />
        <Button text="Button" size="sm" endIcon={<ArrowRightIcon className="h-6 w-6" />} />
        <Button
          text="Button"
          size="sm"
          startIcon={<SearchIcon />}
          endIcon={<ArrowRightIcon className="h-6 w-6" />}
        />
      </Stack>
      <Stack>
        <Button icon={<SearchIcon />} />
        <Button icon={<SearchIcon />} size="sm" />
        <Button icon={<SearchIcon />} disabled />
        <Button icon={<SearchIcon />} size="sm" disabled />
      </Stack>

      <Stack>
        <Button variant="black-outline" text="Button" />
        <Button variant="black-outline" text="Button" size="sm" />
        <Button variant="black-outline" text="Button disabled" disabled />
        <Button variant="black-outline" text="Button disabled" size="sm" disabled />
      </Stack>
      <Stack>
        <Button variant="black-outline" text="Button" startIcon={<SearchIcon />} />
        <Button
          variant="black-outline"
          text="Button"
          endIcon={<ArrowRightIcon className="h-6 w-6" />}
        />
        <Button
          variant="black-outline"
          text="Button"
          startIcon={<SearchIcon />}
          endIcon={<ArrowRightIcon className="h-6 w-6" />}
        />
        <Button variant="black-outline" text="Button" size="sm" startIcon={<SearchIcon />} />
        <Button
          variant="black-outline"
          text="Button"
          size="sm"
          endIcon={<ArrowRightIcon className="h-6 w-6" />}
        />
        <Button
          variant="black-outline"
          text="Button"
          size="sm"
          startIcon={<SearchIcon />}
          endIcon={<ArrowRightIcon className="h-6 w-6" />}
        />
      </Stack>
      <Stack>
        <Button variant="black-outline" icon={<SearchIcon />} />
        <Button variant="black-outline" icon={<SearchIcon />} size="sm" />
        <Button variant="black-outline" icon={<SearchIcon />} disabled />
        <Button variant="black-outline" icon={<SearchIcon />} size="sm" disabled />
      </Stack>

      <Stack>
        <Button variant="negative" text="Button" />
        <Button variant="negative" text="Button" size="sm" />
        <Button variant="negative" text="Button disabled" disabled />
        <Button variant="negative" text="Button disabled" size="sm" disabled />
      </Stack>
      <Stack>
        <Button variant="negative" text="Button" startIcon={<SearchIcon />} />
        <Button variant="negative" text="Button" endIcon={<ArrowRightIcon className="h-6 w-6" />} />
        <Button
          variant="negative"
          text="Button"
          startIcon={<SearchIcon />}
          endIcon={<ArrowRightIcon className="h-6 w-6" />}
        />
        <Button variant="negative" text="Button" size="sm" startIcon={<SearchIcon />} />
        <Button
          variant="negative"
          text="Button"
          size="sm"
          endIcon={<ArrowRightIcon className="h-6 w-6" />}
        />
        <Button
          variant="negative"
          text="Button"
          size="sm"
          startIcon={<SearchIcon />}
          endIcon={<ArrowRightIcon className="h-6 w-6" />}
        />
      </Stack>

      <Stack>
        <Button variant="plain-category" text="Button" />
        <Button variant="plain-category" text="Button" size="sm" />
        <Button variant="plain-category" text="Button disabled" disabled />
        <Button variant="plain-category" text="Button disabled" size="sm" disabled />
      </Stack>
      <Stack>
        <Button variant="plain-category" icon={<SearchIcon />} />
        <Button variant="plain-category" icon={<SearchIcon />} size="sm" />
        <Button variant="plain-category" icon={<SearchIcon />} disabled />
        <Button variant="plain-category" icon={<SearchIcon />} size="sm" disabled />
      </Stack>

      <Stack>
        <Button variant="plain-black" text="Button" />
        <Button variant="plain-black" text="Button" size="sm" />
        <Button variant="plain-black" text="Button disabled" disabled />
        <Button variant="plain-black" text="Button disabled" size="sm" disabled />
      </Stack>
      <Stack>
        <Button variant="plain-black" icon={<SearchIcon />} />
        <Button variant="plain-black" icon={<SearchIcon />} size="sm" />
        <Button variant="plain-black" icon={<SearchIcon />} disabled />
        <Button variant="plain-black" icon={<SearchIcon />} size="sm" disabled />
      </Stack>

      <Stack>
        <Button variant="plain-negative" text="Button" />
        <Button variant="plain-negative" text="Button" size="sm" />
        <Button variant="plain-negative" text="Button disabled" disabled />
        <Button variant="plain-negative" text="Button disabled" size="sm" disabled />
      </Stack>

      <Stack>
        <Button variant="link-category" href="#" label="Label value" />
        <Button variant="link-category" href="#" label="Label value" size="sm" />
      </Stack>
      <Stack>
        <Button variant="link-black" href="#" label="Label value" />
        <Button variant="link-black" href="#" label="Label value" size="sm" />
      </Stack>
      <Stack>
        <Stack>
          <Button text="Not Loading" variant="category" />
          <Button
            text="Not Loading"
            size="sm"
            endIcon={<SearchIcon />}
            variant="category-outline"
          />
          <Button text="Not Loading" variant="black" />
          <Button icon={<SearchIcon />} size="sm" variant="black-outline" />
          <Button text="Not Loading" variant="negative" />
          <Button text="Not Loading" size="sm" endIcon={<SearchIcon />} variant="plain-black" />
          <Button text="Not Loading" variant="plain-category" />
          <Button icon={<SearchIcon />} size="sm" variant="plain-negative" />
          <Button text="Not Loading" size="sm" endIcon={<SearchIcon />} variant="link-black" />
          <Button text="Not Loading" variant="link-category" />
        </Stack>
        <Stack>
          <Button text="Not Loading" loading variant="category" />
          <Button
            text="Not Loading"
            size="sm"
            endIcon={<SearchIcon />}
            loading
            variant="category-outline"
          />
          <Button text="Not Loading" variant="black" loading />
          <Button icon={<SearchIcon />} size="sm" loading variant="black-outline" />
          <Button text="Not Loading" loading variant="negative" />
          <Button
            text="Not Loading"
            size="sm"
            endIcon={<SearchIcon />}
            loading
            variant="plain-black"
          />
          <Button text="Not Loading" variant="plain-category" loading />
          <Button icon={<SearchIcon />} size="sm" loading variant="plain-negative" />
          <Button
            text="Not Loading"
            size="sm"
            endIcon={<SearchIcon />}
            loading
            variant="link-black"
          />
          <Button text="Not Loading" variant="link-category" loading />
        </Stack>
      </Stack>
    </Wrapper>
  )
}

export default ButtonShowCase
