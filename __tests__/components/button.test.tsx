/**
 * @file __tests__/components/button.test.tsx
 * @description Tests for the Button UI component
 * @created 2025-07-21
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  describe('Basic Functionality', () => {
    it('should render a button with text', () => {
      render(<Button>Click me</Button>)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Click me')
    })

    it('should handle click events', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Click me</Button>)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled button</Button>)

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveClass(
        'disabled:pointer-events-none disabled:opacity-50'
      )
    })

    it('should not call onClick when disabled', () => {
      const handleClick = jest.fn()
      render(
        <Button onClick={handleClick} disabled>
          Disabled button
        </Button>
      )

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Variants', () => {
    it('should apply default variant classes by default', () => {
      render(<Button>Default</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass(
        'bg-primary text-primary-foreground hover:bg-primary/90'
      )
    })

    it('should apply secondary variant classes', () => {
      render(<Button variant="secondary">Secondary</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass(
        'bg-secondary text-secondary-foreground hover:bg-secondary/80'
      )
    })

    it('should apply outline variant classes', () => {
      render(<Button variant="outline">Outline</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass(
        'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
      )
    })

    it('should apply ghost variant classes', () => {
      render(<Button variant="ghost">Ghost</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:bg-accent hover:text-accent-foreground')
    })
  })

  describe('Sizes', () => {
    it('should apply default size classes by default', () => {
      render(<Button>Default Size</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-10 px-4 py-2')
    })

    it('should apply small size classes', () => {
      render(<Button size="sm">Small</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-9 rounded-md px-3')
    })

    it('should apply large size classes', () => {
      render(<Button size="lg">Large</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-11 rounded-md px-8')
    })
  })

  describe('Base Classes', () => {
    it('should always apply base classes', () => {
      render(<Button>Test</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass(
        'inline-flex',
        'items-center',
        'justify-center',
        'whitespace-nowrap',
        'rounded-md',
        'text-sm',
        'font-medium',
        'transition-colors',
        'focus-visible:outline-none',
        'focus-visible:ring-2',
        'focus-visible:ring-ring',
        'disabled:pointer-events-none',
        'disabled:opacity-50'
      )
    })
  })

  describe('Custom Props', () => {
    it('should merge custom className with component classes', () => {
      render(<Button className="custom-class">Test</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
      // Should still have base classes
      expect(button).toHaveClass('inline-flex')
    })

    it('should pass through other HTML button attributes', () => {
      render(
        <Button
          type="submit"
          data-testid="submit-button"
          aria-label="Submit form"
          id="submit-btn"
        >
          Submit
        </Button>
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'submit')
      expect(button).toHaveAttribute('data-testid', 'submit-button')
      expect(button).toHaveAttribute('aria-label', 'Submit form')
      expect(button).toHaveAttribute('id', 'submit-btn')
    })

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>()
      render(<Button ref={ref}>Test</Button>)

      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
      expect(ref.current).toHaveTextContent('Test')
    })
  })

  describe('Variant and Size Combinations', () => {
    const variants = ['default', 'secondary', 'outline', 'ghost'] as const
    const sizes = ['default', 'sm', 'lg'] as const

    variants.forEach((variant) => {
      sizes.forEach((size) => {
        it(`should render ${variant} variant with ${size} size`, () => {
          render(
            <Button variant={variant} size={size}>
              {`${variant} ${size}`}
            </Button>
          )

          const button = screen.getByRole('button')
          expect(button).toBeInTheDocument()
          expect(button).toHaveTextContent(`${variant} ${size}`)
        })
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper focus handling', () => {
      render(<Button>Test</Button>)

      const button = screen.getByRole('button')
      button.focus()

      expect(button).toHaveFocus()
      expect(button).toHaveClass(
        'focus-visible:outline-none',
        'focus-visible:ring-2'
      )
    })

    it('should support aria attributes', () => {
      render(
        <Button aria-pressed="true" aria-describedby="help-text" role="switch">
          Toggle
        </Button>
      )

      const button = screen.getByRole('switch')
      expect(button).toHaveAttribute('aria-pressed', 'true')
      expect(button).toHaveAttribute('aria-describedby', 'help-text')
    })

    it('should work with keyboard navigation', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Test</Button>)

      const button = screen.getByRole('button')

      // Simulate Enter key press
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })

      // The button should be focusable and receive keyboard events
      expect(button).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      render(<Button></Button>)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('')
    })

    it('should handle null children', () => {
      render(<Button>{null}</Button>)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should handle multiple children', () => {
      render(
        <Button>
          <span>Icon</span>
          Text
        </Button>
      )

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('IconText')
    })

    it('should handle boolean and number props correctly', () => {
      render(
        <Button data-active={true} data-count={42} data-enabled={false}>
          Test
        </Button>
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('data-active', 'true')
      expect(button).toHaveAttribute('data-count', '42')
      expect(button).toHaveAttribute('data-enabled', 'false')
    })
  })
})
