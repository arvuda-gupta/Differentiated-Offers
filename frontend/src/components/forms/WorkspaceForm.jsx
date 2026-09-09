import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input, Select } from '../common/Input';
import { Button } from '../common/Button';
import { ARCHETYPES, REGIONS, COUNTRIES, OWNER_ROLES, COUNTRY_REGION_MAP } from '../../utils/constants';

export const WorkspaceForm = ({ onSubmit, isLoading, initialValues }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: initialValues || {
      name: '',
      owner_role: 'Innovation Manager',
      archetype: 'Product Plus',
      region: 'DACH',
      country: 'DE',
    },
  });

  useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  const selectedCountry = watch('country');

  useEffect(() => {
    if (selectedCountry && COUNTRY_REGION_MAP[selectedCountry]) {
      setValue('region', COUNTRY_REGION_MAP[selectedCountry]);
    }
  }, [selectedCountry, setValue]);

  const roleOptions = OWNER_ROLES.map((r) => ({ value: r, label: r }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Workspace Name"
        placeholder="e.g., Nitrogen Efficiency Optimizer"
        error={errors.name?.message}
        {...register('name', { required: 'Workspace name is required' })}
      />

      <Select
        label="Owner Role"
        options={roleOptions}
        {...register('owner_role')}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Offer Archetype"
          options={ARCHETYPES}
          {...register('archetype')}
        />

        <Select
          label="Country"
          options={COUNTRIES}
          {...register('country')}
        />
      </div>

      <Select
        label="Target Region"
        options={REGIONS}
        {...register('region')}
      />

      <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
        <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto">
          {initialValues ? 'Update Workspace' : 'Create Workspace'}
        </Button>
      </div>
    </form>
  );
};
