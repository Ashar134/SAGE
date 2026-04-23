import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from './HomePage';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the CSS import to avoid parsing errors in tests
vi.mock('./HomePage.css', () => ({ default: '' }));

describe('HomePage Filtering', () => {
    beforeEach(() => {
        // Reset time if needed or clean up
    });

    it('renders the job list initially', () => {
        render(<HomePage />);
        // Should find "Product Designer", "Copywriting Specialist", "Full Stack Developer"
        expect(screen.getByText('Product Designer')).toBeInTheDocument();
        expect(screen.getByText('Copywriting Specialist')).toBeInTheDocument();
        expect(screen.getByText('Full Stack Developer')).toBeInTheDocument();
    });

    it('filters by search term', () => {
        render(<HomePage />);
        const searchInput = screen.getByPlaceholderText('Search job title or keyword');

        fireEvent.change(searchInput, { target: { value: 'Product' } });

        expect(screen.getByText('Product Designer')).toBeInTheDocument();
        expect(screen.queryByText('Copywriting Specialist')).not.toBeInTheDocument();
    });

    it('filters by location', () => {
        render(<HomePage />);
        const locationInput = screen.getByPlaceholderText('Country or timezone');

        fireEvent.change(locationInput, { target: { value: 'France' } });

        expect(screen.getByText('Copywriting Specialist')).toBeInTheDocument();
        expect(screen.queryByText('Product Designer')).not.toBeInTheDocument();
    });

    it('filters by job type (Freelance)', () => {
        render(<HomePage />);

        // Find the checkbox for Freelance. 
        // Note: Labels are "Freelance", inputs are inside label.
        // We can find by label text.
        const freelanceCheckbox = screen.getByLabelText('Freelance');
        fireEvent.click(freelanceCheckbox);

        expect(screen.getByText('Copywriting Specialist')).toBeInTheDocument();
        expect(screen.queryByText('Product Designer')).not.toBeInTheDocument();
    });

    it('filters by Date Posted (Today)', () => {
        render(<HomePage />);

        // Product Designer is "Posted 5 mins ago" (mocked as new Date())
        // Others are 3 days ago and 1 day ago.
        // Wait, "Today" logic is: diffDays <= 1. 
        // "Full Stack Developer" is daysAgo(1), so it *might* show up depending on strict logic (<24h vs calendar day).
        // My logic was `Math.ceil(diffTime / day) <= 1`. 
        // If created just now, ceil is 1? No, if diff is 0, ceil is 0. If diff is small, ceil is 1.
        // If created 24h ago, diff is 1 day. ceil is 1.
        // So "Today" includes things up to 24h ago.

        // Find the select box.
        // The select doesn't have a label, so use class or container.
        const dateValues = screen.getAllByRole('combobox');
        const dateSelect = dateValues[0]; // Assuming first select

        fireEvent.change(dateSelect, { target: { value: 'Today' } });

        expect(screen.getByText('Product Designer')).toBeInTheDocument();
        expect(screen.queryByText('Copywriting Specialist')).not.toBeInTheDocument(); // 3 days ago
    });

    it('filters by Remote', () => {
        render(<HomePage />);
        const remoteCheckbox = screen.getByLabelText('Remote');
        fireEvent.click(remoteCheckbox);

        // Copywriting Specialist is mocked as isRemote: true
        expect(screen.getByText('Copywriting Specialist')).toBeInTheDocument();
        expect(screen.queryByText('Product Designer')).not.toBeInTheDocument();
    });

    it('filters by Salary (Under $1000)', () => {
        render(<HomePage />);
        const under1000Radio = screen.getByLabelText('Under $1000');
        fireEvent.click(under1000Radio);

        // Copywriting: 1600-1800 (No)
        // Product: 3000-5000 (No)
        // Full Stack: 100-2000 (Max is 2000, but logic was: `job.salaryMax < 1000`. 
        // Full Stack max is 2000. So false.
        // Wait, is there any job under 1000?
        // Full Stack Min is 100. Range is 100-2000.
        // Logic check: `job.salaryMax < 1000`. So strictly under 1000.
        // None of the sample jobs strictly fit "Under 1000" if max is considered.
        // Let's check "Full Stack Developer" with a Custom filter of 2000.

        expect(screen.queryByText('Product Designer')).not.toBeInTheDocument();
    });

    it('filters by Salary (Custom Slider)', () => {
        render(<HomePage />);
        const customRadio = screen.getByLabelText('Custom');
        fireEvent.click(customRadio);

        const slider = screen.getByRole('slider');
        // Set slider to 2000. 
        // Logic: job.salaryMin <= sliderValue.
        // Product Designer Min is 3000. Should NOT show.
        // Copywriting Min is 1600. Should show.
        // Full Stack Min is 100. Should show.
        fireEvent.change(slider, { target: { value: '2000' } });

        expect(screen.getByText('Copywriting Specialist')).toBeInTheDocument();
        expect(screen.getByText('Full Stack Developer')).toBeInTheDocument();
        expect(screen.queryByText('Product Designer')).not.toBeInTheDocument();
    });

    it('clears all filters', () => {
        render(<HomePage />);

        // Apply some filters
        const searchInput = screen.getByPlaceholderText('Search job title or keyword');
        fireEvent.change(searchInput, { target: { value: 'NothingMatchesThis' } });
        expect(screen.queryByText('Product Designer')).not.toBeInTheDocument();

        // Click Clear All
        const clearBtn = screen.getByText('Clear all');
        fireEvent.click(clearBtn);

        // Should appear again
        expect(screen.getByText('Product Designer')).toBeInTheDocument();
    });
});
