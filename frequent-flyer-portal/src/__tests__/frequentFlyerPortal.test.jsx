import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import App from '../App'

describe('End-to-End Frequent Flyer Portal (ENG-163087)', () => {
  describe('Happy Path', () => {
    // 1. Portal shows a heading, a search box, an "Add Flyer" button and a flyer list.
    it('AC 1: displays heading, search box, Add Flyer button, and flyer list', async () => {
      render(<App />)

      expect(
        screen.getByRole('heading', { level: 1, name: /frequent flyer portal/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('searchbox', { name: /search flyers/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /add flyer/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('list', { name: /flyers|frequent flyers/i })
      ).toBeInTheDocument()
    })

    // 2. Staff can add a flyer through a form and see it in the list.
    it('AC 2: allows staff to add a flyer through a form and displays it in the list', async () => {
      const user = userEvent.setup()
      render(<App />)

      const addBtn = screen.getByRole('button', { name: /add flyer/i })
      await user.click(addBtn)

      const dialog = screen.getByRole('dialog', { name: /add flyer|new flyer/i })
      expect(dialog).toBeInTheDocument()

      await user.type(within(dialog).getByLabelText(/name/i), 'Amelia Earhart')
      await user.type(within(dialog).getByLabelText(/email/i), 'amelia@airline.com')
      await user.type(
        within(dialog).getByLabelText(/membership number/i),
        'FF-100200'
      )
      await user.selectOptions(within(dialog).getByLabelText(/tier/i), 'Platinum')
      await user.clear(within(dialog).getByLabelText(/points/i))
      await user.type(within(dialog).getByLabelText(/points/i), '85000')

      await user.click(
        within(dialog).getByRole('button', { name: /save|submit|confirm/i })
      )

      expect(await screen.findByText('Amelia Earhart')).toBeInTheDocument()
      expect(screen.getByText('amelia@airline.com')).toBeInTheDocument()
      expect(screen.getByText('FF-100200')).toBeInTheDocument()
      expect(screen.getByText('Platinum')).toBeInTheDocument()
      expect(screen.getByText(/85,?000/)).toBeInTheDocument()
    })

    // 3. Staff can edit and delete a flyer.
    it('AC 3: allows staff to edit an existing flyer', async () => {
      const user = userEvent.setup()
      render(<App />)

      const flyerItem = await screen.findByRole('listitem', {
        name: /amelia|flyer/i,
      })
      const editBtn = within(flyerItem).getByRole('button', { name: /edit/i })
      await user.click(editBtn)

      const dialog = screen.getByRole('dialog', { name: /edit flyer/i })
      const pointsInput = within(dialog).getByLabelText(/points/i)
      await user.clear(pointsInput)
      await user.type(pointsInput, '95000')

      const tierSelect = within(dialog).getByLabelText(/tier/i)
      await user.selectOptions(tierSelect, 'Gold')

      await user.click(
        within(dialog).getByRole('button', { name: /save|update/i })
      )

      expect(await screen.findByText(/95,?000/)).toBeInTheDocument()
      expect(screen.getByText('Gold')).toBeInTheDocument()
    })

    it('AC 3: allows staff to delete a flyer from the list', async () => {
      const user = userEvent.setup()
      render(<App />)

      const flyerItem = await screen.findByRole('listitem', { name: /flyer/i })
      const deleteBtn = within(flyerItem).getByRole('button', { name: /delete/i })
      await user.click(deleteBtn)

      const confirmBtn = screen.queryByRole('button', {
        name: /confirm delete|yes, delete/i,
      })
      if (confirmBtn) {
        await user.click(confirmBtn)
      }

      await waitFor(() => {
        expect(
          screen.queryByRole('listitem', { name: /flyer/i })
        ).not.toBeInTheDocument()
      })
    })

    // 4. Search filters the list instantly.
    it('AC 4: filters the list instantly when staff types in the search box', async () => {
      const user = userEvent.setup()
      render(<App />)

      expect(await screen.findByText(/charles lindbergh/i)).toBeInTheDocument()
      expect(screen.getByText(/bessie coleman/i)).toBeInTheDocument()

      const searchInput = screen.getByRole('searchbox', {
        name: /search flyers/i,
      })
      await user.type(searchInput, 'Bessie')

      expect(screen.getByText(/bessie coleman/i)).toBeInTheDocument()
      expect(screen.queryByText(/charles lindbergh/i)).not.toBeInTheDocument()

      await user.clear(searchInput)
      expect(screen.getByText(/charles lindbergh/i)).toBeInTheDocument()
      expect(screen.getByText(/bessie coleman/i)).toBeInTheDocument()
    })

    // 5. Data keeps a consistent structure (same fields for every flyer).
    it('AC 5: keeps a consistent data structure with all five fields for every flyer', async () => {
      render(<App />)

      const flyerItems = await screen.findAllByRole('listitem')
      expect(flyerItems.length).toBeGreaterThan(0)

      flyerItems.forEach((item) => {
        expect(within(item).getByTestId('flyer-name')).toBeInTheDocument()
        expect(within(item).getByTestId('flyer-email')).toBeInTheDocument()
        expect(
          within(item).getByTestId('flyer-membership-number')
        ).toBeInTheDocument()
        expect(within(item).getByTestId('flyer-tier')).toBeInTheDocument()
        expect(within(item).getByTestId('flyer-points')).toBeInTheDocument()
      })
    })
  })

  describe('Unhappy Path', () => {
    // 6. Empty list or no search match shows a "No data found" message, never a blank screen.
    it('AC 6: shows "No data found" message when a search has no match, never a blank screen', async () => {
      const user = userEvent.setup()
      render(<App />)

      const searchInput = await screen.findByRole('searchbox', {
        name: /search flyers/i,
      })
      await user.type(searchInput, 'UnknownNonExistentFlyer_999')

      expect(screen.getByText(/no data found/i)).toBeInTheDocument()
      expect(
        screen.getByRole('heading', { level: 1, name: /frequent flyer portal/i })
      ).toBeInTheDocument()
      expect(searchInput).toBeInTheDocument()
    })

    it('AC 6: shows "No data found" message when the flyer list is empty', async () => {
      render(<App initialFlyers={[]} />)

      expect(await screen.findByText(/no data found/i)).toBeInTheDocument()
      expect(
        screen.getByRole('heading', { level: 1, name: /frequent flyer portal/i })
      ).toBeInTheDocument()
    })

    // 7. During any async operation a loading indicator is visible (simulate slow 3G with a delayed mock service).
    it('AC 7: shows a visible loading indicator during async operations (simulated slow 3G)', async () => {
      render(<App />)

      const loader =
        screen.queryByRole('status', { name: /loading/i }) ||
        screen.queryByText(/loading/i) ||
        screen.queryByTestId('loading-indicator')

      expect(loader).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
      })
    })

    // 8. Submitting the form with missing or malformed data (empty name, invalid email, negative points) is blocked, and the offending fields are marked with aria-invalid and a red error style.
    it('AC 8: blocks submission with empty name and marks it with aria-invalid and red error style', async () => {
      const user = userEvent.setup()
      render(<App />)

      const addBtn = screen.getByRole('button', { name: /add flyer/i })
      await user.click(addBtn)

      const dialog = screen.getByRole('dialog', { name: /add flyer/i })
      const nameInput = within(dialog).getByLabelText(/name/i)
      const submitBtn = within(dialog).getByRole('button', {
        name: /save|submit/i,
      })

      await user.clear(nameInput)
      await user.type(
        within(dialog).getByLabelText(/email/i),
        'pilot@airline.com'
      )
      await user.type(
        within(dialog).getByLabelText(/membership number/i),
        'FF-555'
      )
      await user.type(within(dialog).getByLabelText(/points/i), '1000')
      await user.click(submitBtn)

      expect(nameInput).toHaveAttribute('aria-invalid', 'true')
      expect(nameInput.className).toMatch(/error|invalid|border-red/)
    })

    it('AC 8: blocks submission with invalid email and marks it with aria-invalid and red error style', async () => {
      const user = userEvent.setup()
      render(<App />)

      const addBtn = screen.getByRole('button', { name: /add flyer/i })
      await user.click(addBtn)

      const dialog = screen.getByRole('dialog', { name: /add flyer/i })
      const emailInput = within(dialog).getByLabelText(/email/i)
      const submitBtn = within(dialog).getByRole('button', {
        name: /save|submit/i,
      })

      await user.type(within(dialog).getByLabelText(/name/i), 'Valid Pilot')
      await user.type(emailInput, 'invalid-email-format')
      await user.type(
        within(dialog).getByLabelText(/membership number/i),
        'FF-777'
      )
      await user.type(within(dialog).getByLabelText(/points/i), '2000')
      await user.click(submitBtn)

      expect(emailInput).toHaveAttribute('aria-invalid', 'true')
      expect(emailInput.className).toMatch(/error|invalid|border-red/)
    })

    it('AC 8: blocks submission with negative points and marks it with aria-invalid and red error style', async () => {
      const user = userEvent.setup()
      render(<App />)

      const addBtn = screen.getByRole('button', { name: /add flyer/i })
      await user.click(addBtn)

      const dialog = screen.getByRole('dialog', { name: /add flyer/i })
      const pointsInput = within(dialog).getByLabelText(/points/i)
      const submitBtn = within(dialog).getByRole('button', {
        name: /save|submit/i,
      })

      await user.type(within(dialog).getByLabelText(/name/i), 'Valid Pilot')
      await user.type(
        within(dialog).getByLabelText(/email/i),
        'pilot@airline.com'
      )
      await user.type(
        within(dialog).getByLabelText(/membership number/i),
        'FF-888'
      )
      await user.clear(pointsInput)
      await user.type(pointsInput, '-500')
      await user.click(submitBtn)

      expect(pointsInput).toHaveAttribute('aria-invalid', 'true')
      expect(pointsInput.className).toMatch(/error|invalid|border-red/)
    })

    // 9. If the async service fails, an error message with a Retry button appears and the app does not crash.
    it('AC 9: displays error message with Retry button when async service fails, without crashing', async () => {
      const user = userEvent.setup()
      render(<App simulateServiceError={true} />)

      const alert = await screen.findByRole('alert')
      expect(alert).toBeInTheDocument()

      const retryBtn = screen.getByRole('button', { name: /retry/i })
      expect(retryBtn).toBeInTheDocument()

      await user.click(retryBtn)
      expect(
        screen.getByRole('heading', { level: 1, name: /frequent flyer portal/i })
      ).toBeInTheDocument()
    })
  })

  describe('Non-Functional Requirements (NFRs)', () => {
    // 10. vitest-axe reports zero accessibility violations.
    it('AC 10: reports zero accessibility violations across portal layout via vitest-axe', async () => {
      const { container } = render(<App />)

      // The portal elements must be rendered before running axe
      expect(
        screen.getByRole('searchbox', { name: /search flyers/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('list', { name: /flyers|frequent flyers/i })
      ).toBeInTheDocument()

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    // 11. Every button and input has an accessible name (label or aria-label) and works with the keyboard (Tab, Enter, Escape).
    it('AC 11: ensures every button and input has an accessible name', () => {
      render(<App />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
      buttons.forEach((button) => {
        expect(button).toHaveAccessibleName()
      })

      const textboxes = screen.getAllByRole('textbox')
      expect(textboxes.length).toBeGreaterThan(0)
      textboxes.forEach((textbox) => {
        expect(textbox).toHaveAccessibleName()
      })
    })

    it('AC 11: supports keyboard interactions with Tab, Enter, and Escape', async () => {
      const user = userEvent.setup()
      render(<App />)

      const addBtn = screen.getByRole('button', { name: /add flyer/i })
      addBtn.focus()
      expect(addBtn).toHaveFocus()

      await user.keyboard('{Enter}')
      const dialog = screen.getByRole('dialog', { name: /add flyer/i })
      expect(dialog).toBeInTheDocument()

      await user.keyboard('{Escape}')
      expect(
        screen.queryByRole('dialog', { name: /add flyer/i })
      ).not.toBeInTheDocument()
    })

    // 12. When a primary action completes (add, edit, delete), console.log is called with "[Analytics] User interacted with End-to-End Frequent Flyer Portal".
    it('AC 12: logs analytics message when Add Flyer primary action completes', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const user = userEvent.setup()
      render(<App />)

      const addBtn = screen.getByRole('button', { name: /add flyer/i })
      await user.click(addBtn)

      const dialog = screen.getByRole('dialog', { name: /add flyer/i })
      await user.type(within(dialog).getByLabelText(/name/i), 'Orville Wright')
      await user.type(
        within(dialog).getByLabelText(/email/i),
        'orville@wright.org'
      )
      await user.type(
        within(dialog).getByLabelText(/membership number/i),
        'FF-001'
      )
      await user.selectOptions(within(dialog).getByLabelText(/tier/i), 'Gold')
      await user.clear(within(dialog).getByLabelText(/points/i))
      await user.type(within(dialog).getByLabelText(/points/i), '50000')

      await user.click(
        within(dialog).getByRole('button', { name: /save|submit/i })
      )

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Analytics] User interacted with End-to-End Frequent Flyer Portal'
      )

      consoleSpy.mockRestore()
    })

    it('AC 12: logs analytics message when Edit Flyer primary action completes', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const user = userEvent.setup()
      render(<App />)

      const flyerItem = await screen.findByRole('listitem', { name: /flyer/i })
      const editBtn = within(flyerItem).getByRole('button', { name: /edit/i })
      await user.click(editBtn)

      const dialog = screen.getByRole('dialog', { name: /edit flyer/i })
      await user.type(within(dialog).getByLabelText(/points/i), '1000')
      await user.click(
        within(dialog).getByRole('button', { name: /save|update/i })
      )

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Analytics] User interacted with End-to-End Frequent Flyer Portal'
      )

      consoleSpy.mockRestore()
    })

    it('AC 12: logs analytics message when Delete Flyer primary action completes', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const user = userEvent.setup()
      render(<App />)

      const flyerItem = await screen.findByRole('listitem', { name: /flyer/i })
      const deleteBtn = within(flyerItem).getByRole('button', {
        name: /delete/i,
      })
      await user.click(deleteBtn)

      const confirmBtn = screen.queryByRole('button', {
        name: /confirm delete|yes, delete/i,
      })
      if (confirmBtn) {
        await user.click(confirmBtn)
      }

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Analytics] User interacted with End-to-End Frequent Flyer Portal'
      )

      consoleSpy.mockRestore()
    })

    // 13. A sanitize utility strips XSS payloads like <script>alert(1)</script> and <img src=x onerror=alert(1)> from text inputs before they are stored in state.
    it('AC 13: strips XSS payloads (<script> and <img onerror>) from text inputs before storing in state', async () => {
      const user = userEvent.setup()
      render(<App />)

      const addBtn = screen.getByRole('button', { name: /add flyer/i })
      await user.click(addBtn)

      const dialog = screen.getByRole('dialog', { name: /add flyer/i })
      await user.type(
        within(dialog).getByLabelText(/name/i),
        'XSS Pilot<script>alert(1)</script>'
      )
      await user.type(
        within(dialog).getByLabelText(/email/i),
        'xsspilot@airline.com'
      )
      await user.type(
        within(dialog).getByLabelText(/membership number/i),
        'FF-999<img src=x onerror=alert(1)>'
      )
      await user.selectOptions(within(dialog).getByLabelText(/tier/i), 'Silver')
      await user.clear(within(dialog).getByLabelText(/points/i))
      await user.type(within(dialog).getByLabelText(/points/i), '12000')

      await user.click(
        within(dialog).getByRole('button', { name: /save|submit/i })
      )

      const flyerItem = await screen.findByRole('listitem', {
        name: /xss pilot/i,
      })
      const nameElem = within(flyerItem).getByTestId('flyer-name')
      const membershipElem = within(flyerItem).getByTestId(
        'flyer-membership-number'
      )

      expect(nameElem.innerHTML).not.toContain('<script>')
      expect(nameElem.innerHTML).not.toContain('alert(1)')
      expect(membershipElem.innerHTML).not.toContain('onerror')
      expect(membershipElem.innerHTML).not.toContain('<img')
    })

    it('AC 13: sanitize utility module strips XSS vectors directly', async () => {
      let sanitizeFn
      try {
        const sanitizePath = '../utils/' + 'sanitize.js'
        const mod = await import(/* @vite-ignore */ sanitizePath)
        sanitizeFn = mod.sanitizeInput || mod.sanitize || mod.default
      } catch {
        // Module not implemented yet
      }

      expect(
        sanitizeFn,
        'sanitize utility should be implemented in src/utils/sanitize.js'
      ).toBeDefined()
      expect(sanitizeFn('<script>alert(1)</script>SafeText')).toBe('SafeText')
      expect(sanitizeFn('<img src=x onerror=alert(1)>SafeCode')).toBe('SafeCode')
    })
  })
})
