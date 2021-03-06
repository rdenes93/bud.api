<?php

namespace AppBundle\Form;

use AppBundle\Entity\Category;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\Extension\Core\Type\DateTimeType,
    Symfony\Component\Form\Extension\Core\Type\TextareaType,
    Symfony\Component\Form\Extension\Core\Type\TextType,
    Symfony\Component\Form\Extension\Core\Type\NumberType;

use Symfony\Component\Form\AbstractType,
    Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class PlaceType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('name', TextType::class, ['required' => true])
            ->add('shortDescription', TextAreaType::class, ['required' => true])
            ->add('rating', NumberType::class, ['required' => true])
            ->add('priceRange', NumberType::class, ['required' => true])
            ->add('categories', EntityType::class, ['class' => Category::class, 'multiple' => true, 'required' => true])
            ->add('fullDescription', TextAreaType::class, ['required' => true])
            ->add('address', TextType::class)
            ->add('latitude', TextType::class)
            ->add('longitude', TextType::class)
            ->add('phonenumber', TextType::class)
            ->add('website', TextType::class)
            ->add('opened', TextType::class)
            ->add('googleID', TextType::class)
        ;
    }
    
    /**
     * @param OptionsResolver $resolver
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class'            => 'AppBundle\Entity\Place',
            'csrf_protection'       => false,
            'allow_extra_fields'    => true
        ]);
    }
}
