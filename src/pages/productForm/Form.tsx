//External Imports
import React, { FC, useState, ChangeEvent, useEffect, Fragment } from 'react';
import { FiArrowLeft, FiPlus } from 'react-icons/fi';
import { Link, useLocation, useNavigate } from 'react-router-dom';

//Local Imports
import chair from '../../../public/assets/images/Vector3.png';
import lamp from '../../../public/assets/images/Vector4.png';
import getProductBySKU, {
  getCategoryList,
  getProductsFromIDs,
  getVendorList,
  saveProduct,
} from '@api-requests/products';
import { modifyProject, saveProject } from '@api-requests/projects';
import useSetInterval from '@hooks/use-set-interval';
import {
  IDOMMessage,
  TDOMMessageType,
  IFormInformation,
  IVendorDetails,
  ICategoryDetails,
} from 'types';

//Component Library
import { Button } from '@fulhaus/react.components.button';
import { Select } from '@fulhaus/react.components.select';
import { TextInput } from '@fulhaus/react.components.text-input';
import { Loader } from '@fulhaus/react.components.loader';

const ProductForm = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const {
    // draft,
    room,
    category,
    organizationID,
    projectID,
    storedProject,
    unitIndex,
    roomIndex,
  }: // draftIndex,
  any = state;

  console.log(
    // 'draft: ',
    // draft,
    'room: ',room,
    'category: ', category,
    'organizationID: ',organizationID,
    'projectID: ',projectID,
    'storedProject: ', storedProject
  );

  const [activeInputId, updateActiveInputId, imageURLs, lifeStyleImageURLs] =
    useSetInterval();

  const [selectWeightUnit, setSelectWeightUnit] = useState<string>();
  const [selectDimensionUnit, setSelectDimensionUnit] = useState<string>();
  const [selectCurrency, setSelectCurrency] = useState<string>();

  const [selectCategory, setSelectCategory] = useState<string>();
  const [categoryDetails, setCategoryDetails] = useState<ICategoryDetails[]>();

  const [selectVendor, setSelectVendor] = useState<string>();
  const [vendorDetails, setVendorDetails] = useState<IVendorDetails[]>();
  const [categoryIndex, setCategoryIndex] = useState<number>();

  const [areVendorsLoading, setAreVendorsLoading] = useState<boolean>(false);

  useEffect(() => {
    productInitialization();
    chrome.storage.local.clear();
  }, []);

  useEffect(() => {
    const selectedCategoryID = categoryDetails?.filter(
      (categoryDetail) => categoryDetail?.name.toLowerCase() === selectCategory?.toLowerCase()
    )[0]?._id;

    console.log('categoryDetails: ', categoryDetails);
    console.log('selectCategory: ', selectCategory);
    console.log('selectedCategoryID: ', selectedCategoryID);

    // const foundCategoryIndice = categoryDetails?.findIndex(
    //   (categoryDetail: any) => categoryDetail.name.toLowerCase() === selectCategory?.toLowerCase()
    // );
    // setCategoryIndex((categoryIndex) => (categoryIndex = foundCategoryIndice))
    // console.log('foundCategoryIndice: ', foundCategoryIndice, 'categoryIndex: ', categoryIndex);
  }, [selectCategory]);

  const refreshPage = () => window.location.reload();

  const productInitialization = async () => {
    setAreVendorsLoading(true);

    const [getVendorResponse, getCategoryResponse] = await Promise.all([
      getVendorList(),
      getCategoryList(),
    ]);
    //returns values sorted alphabetically to be used in dropdown menus
    const vendorData = getVendorResponse.data;
    vendorData.sort((a: any, b: any) => {
      return a.name > b.name ? 1 : -1;
    });
    const categoryData = getCategoryResponse.data;
    categoryData.sort((a: any, b: any) => {
      return a.name > b.name ? 1 : -1;
    });
    if (getVendorResponse?.success) setVendorDetails(vendorData);
    if (getCategoryResponse?.success) setCategoryDetails(categoryData);
    setTimeout(()=> {
      setAreVendorsLoading(false)
    }, 3000)
  };

  const handleSendMessageToBrowserListener = async (
    inputName: string,
    inputType: TDOMMessageType
  ) => {
    chrome.storage.local.get(console.log);
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    chrome.tabs.sendMessage(tab.id || 0, { msg: inputType } as IDOMMessage);
    updateActiveInputId(inputName);
  };

  const getFinalInputValues = () => {
    const finalInputValues: {
      [key: string]: string | undefined | string[] | boolean;
    } = {};
    for (const value of initialInformation) {
      const inputElement = document.getElementById(
        value.name
      ) as HTMLInputElement;
      finalInputValues[value.name] = inputElement.value;
    }
    for (const value of imageInformation) {
      const inputElement = document.getElementById(
        value.name
      ) as HTMLInputElement;
      finalInputValues[value.name] = inputElement.value;
    }
    for (const value of stockInformation) {
      const inputElement = document.getElementById(
        value.name
      ) as HTMLInputElement;
      finalInputValues[value.name] = inputElement.value;
    }
    for (const value of dimensionsInformation) {
      const inputElement = document.getElementById(
        value.name
      ) as HTMLInputElement;
      finalInputValues[value.name] = inputElement.value;
    }
    for (const value of additionalInformation) {
      const inputElement = document.getElementById(
        value.name
      ) as HTMLInputElement;
      finalInputValues[value.name] = inputElement.value;
    }

    finalInputValues.imageURLs = imageURLs ?? [];
    finalInputValues.lifeStyleImageURLs = lifeStyleImageURLs ?? [];
    finalInputValues.currency = selectCurrency;
    finalInputValues.weightUnit = selectWeightUnit;
    finalInputValues.dimensionUnit = selectDimensionUnit;
    finalInputValues.category = selectCategory;

    const categoryId = categoryDetails?.filter(
      (categoryDetail) =>
        categoryDetail?.name?.toLowerCase()?.trim() ===
        selectCategory?.toLowerCase()?.trim()
    )?.[0]?._id;

    finalInputValues.fulhausCategory = categoryId;
    finalInputValues.clipped = true;
    finalInputValues.description = (
      document.getElementById('description') as any
    ).value;

    console.log('finalInputValues: ', finalInputValues);

    return finalInputValues;
  };

  const handleSaveProduct = async () => {
  
    const productDetails = getFinalInputValues();
    const sku = productDetails.sku
    console.log('sku: ', sku)
    const vendorId = vendorDetails?.filter(
      (vendorDetail) =>
        vendorDetail?.name?.toLowerCase()?.trim() ===
        selectVendor?.toLowerCase()?.trim()
    )?.[0]?._id;
    console.log('vendorID: ', vendorId, 'productDetails: ', productDetails);

    if (Object.keys(productDetails).length < 1 || !vendorId) return;

    const response: any = await saveProduct({
      productDetails: [productDetails],
      vendorId,
    });
    const productsNotUploaded = response?.productsNotUploaded;
    const isUploaded = (productsNotUploaded?.length ?? 1) < 1;

    if (!isUploaded) {
      //TO DO:  Implement chrome notification instead of alert
      // chrome.notifications.create('saveError', {
      //   type: 'basic',
      //   iconUrl: './assets/icon16.png',
      //   title: 'Save Error',
      //   message: `Oops!  Error: ${response?.message, productsNotUploaded[0].error.split()}`,
      //   priority: 2
      //     })

      alert(
        `Oops!  Error: ${
          (response?.message, productsNotUploaded[0].error.split())
        }`
      );
      return console.log(
        '!response: ',
        response,
        'error:',
        productsNotUploaded[0].error
      );
    }
    if (isUploaded) {
      alert('New Product Successfully Created!');
    }
    handleSaveToProject(sku as string);
  };

  const handleSaveToProject = async(sku:string) => {
    const versionName = storedProject.quote.version
    const project = storedProject

    
//need to update version name?
//need to insert the above saved product into the current project
//search to see if category is already a part of the project.
//If not, use the categoryID add a new category to the project
//make call to product backend to retrieve product just saved
//add that product to the category found or newly added 
//now do the same for the design => 
//send project to saveProject endpoint

//call product BE to get newly added product

const productSkuResponse:any = await getProductBySKU({sku} as any)
console.log({productSkuResponse})

const productIdResponse = await getProductsFromIDs(productSkuResponse?.productID)
console.log({productIdResponse})



const categoryArray = storedProject.quote.data[unitIndex].rooms[roomIndex].categories

categoryArray.filter((category: any) => {
  const foundCategory = category.name.toLowerCase() === selectCategory?.toLowerCase() 
  if (foundCategory) {
    //add new product to existing category products array

  }
  if (!foundCategory) {
    categoryArray.push()//how do you populate a non-existent category object? 
    //and add new product object to existing category products array
  }
})


console.log('storedProject: ', storedProject,
'categoryArray: ', categoryArray,
'categoryIndex: ', categoryIndex
)

const categoryObject = categoryArray.filter((selectedCategory:any) => {
 selectedCategory.name.toLowerCase() === selectCategory?.toLowerCase()
 console.log('selectedCategory: ', selectedCategory)
})[0]

console.log("categoryObject: ", categoryObject, selectCategory)


    // const response = await saveProject ({project, versionName})

    // if (!response?.success) {
    //   console.log('response-error: ', response)
    //   alert(response?.message)
    // }

    // if (response?.success) {
    //   console.log('response: ', response)
    // }
   

// would modifyProject be a better approach?

    // const project = storedProject

    //     const projectData = {
    //       ...project,
    //     }
    //     const modifyProjectResponse = await modifyProject ({
    //       organizationID: organizationID ?? "",
    //       projectID : projectID,
    //       data: projectData,
    //     })
    //   if (modifyProjectResponse.success) console.log('edit project success!')

    //   // clear form after successful product upload
    // refreshPage();
  };

  const handleNavigation = () => {
    navigate('/roomTray', {
      state: {
        // draft: draft,
        room: room,
        // category: category,
        organizationID: organizationID,
        projectID: projectID,
        storedProject: storedProject,
        unitIndex: unitIndex,
        roomIndex: roomIndex,
        // draftIndex: draftIndex,
      },
    });
  };

  const initialInformation: IFormInformation[] = [
    { tag: 'sku', name: 'sku', type: 'number' },
    { tag: 'Product Name', name: 'name', type: 'text' },
  ];
  const imageInformation: IFormInformation[] = [
    { tag: 'Lifestyle Image URL', name: 'lifeStyleImageURLs', type: 'url' },
    { tag: 'Image URL', name: 'imageURLs', type: 'url' },
  ];

  const stockInformation: IFormInformation[] = [
    { tag: 'Stock Quantity', name: 'stockQty', type: 'number' },
    { tag: 'Case Pack', name: 'casePackQty', type: 'number' },
    { tag: 'Trade Price', name: 'tradePrice', type: 'number' },
  ];

  const dimensionsInformation: IFormInformation[] = [
    { tag: 'Dimensions: H', name: 'height', type: 'number' },
    { tag: 'Dimensions: D', name: 'width', type: 'number' },
    { tag: 'Dimensions: L', name: 'length', type: 'number' },
  ];

  const additionalInformation: IFormInformation[] = [
    //map &
    //msrp
    { tag: 'GTIN', name: 'gtin', type: 'text' },
    { tag: 'Warranty Info', name: 'warrantyInfo', type: 'text' },
    { tag: 'Materials', name: 'materials', type: 'text' },
    { tag: 'Care Info', name: 'careInfo', type: 'text' },
    { tag: 'Variants', name: 'variants', type: 'text' },
    { tag: 'Colour', name: 'colorName', type: 'text' },
  ];

  const dimensionsUnitOptions = ['in', 'cm', 'mm', 'ft', 'm'];
  const weightOptions = ['lbs', 'kg', 'gr', 'oz'];
  const currencyOptions = ['CAD', 'USD'];

  return (
    <div className='' id='page_container'>
      <header className='p-3 flex items-center bg-[#101828] text-white'>
        <FiArrowLeft
          onClick={() => handleNavigation()}
          className=' w-10 text-2xl cursor-pointer'
        />
        {/* <h3 className='text-med font-semibold'>{category}</h3> */}
        <h3 className='text-med font-semibold text-center'>
          Clipped Product Info
        </h3>
      </header>

      <section className='' id='vendor_selection'>

        {areVendorsLoading && (
          <div className='flex w-full m-3 justify-center'>
          <Loader
            className='h-6 w-6'
            thickness={2}
            color={'#ffffff'}
            indicatorColor={'#0050B5'}
          />
          </div>
        )}
        {!areVendorsLoading && (
          <>
            <p className='text-center m-3 mt-5 border-solid border-[#5E5E5E]'>
              {' '}
              Select A Vendor
            </p>

            <Select
              label={selectVendor ?? 'Select a Vendor'}
              optionClassName='text-left text-xs m-3'
              className='text-xs m-3 rounded border-solid border-[1px] border-[#5E5E5E]'
              options={(vendorDetails ?? [])?.map((vendorDetail) =>
                vendorDetail?.name?.toUpperCase()
              )}
              onSelect={setSelectVendor}
            />
          </>
        )}

        {!selectVendor && (
          <div className='flex justify-between h-[calc(100vh-10rem)]'>
            <img
              className='h-4/6 ml-1 mt-auto'
              src={chair}
              alt='no product chosen'
            />

            <img
              className='h-4/6 mr-1 mt-auto'
              src={lamp}
              alt='no product chosen'
            />
          </div>
        )}
      </section>

      {selectVendor && (
        <div>
          <form className='px-4 pt-5 text-sm'>
            <div className=' flex justify-end'>
              <Button
                className='w-2/5 border-[#FC4C02] text-[#FC4C02] text-xs bg-[rgba(252,76,2,0.1)]'
                variant={'outlined'}
                onClick={refreshPage}
              >
                Clear Form
              </Button>
            </div>
            <h2 className='font-bold text-lg my-3'>Required Information</h2>

            <section id='required_information_container' className=''>
              {initialInformation.map((item) => (
                <label className=''>
                  {item.tag}
                  <TextInput
                    required
                    className='w-full mb-2 border-solid border-[1px] border-[#5E5E5E] bg-white'
                    variant={'box'}
                    id={item.name}
                    name={item.name}
                    type={'text'}
                    onFocus={(e) =>
                      handleSendMessageToBrowserListener(
                        item.name,
                        'getInnerText'
                      )
                    }
                  />
                </label>
              ))}

              <section id='all_image_urls'>
                {imageInformation.map((item) => (
                  <Fragment>
                    <label className=''>{item.tag}</label>

                    <div
                      id='image_plus_button'
                      className='border-solid border-[1px] border-[#5E5E5E] bg-white w-full  h-fit flex  items-center p-5 gap-2 mb-2'
                    >
                      <FiPlus
                        className='text-2xl text-[#101828] cursor-pointer hover:opacity-50 h-[4rem] w-[4rem] border-solid border-[1px] border-[#5E5E5E]'
                        onClick={(e) =>
                          handleSendMessageToBrowserListener(
                            item.name,
                            'getImageUrl'
                          )
                        }
                      />
                      <div
                        id={item.name}
                        className='flex h-fit flex-1  items-center overflow-scroll gap-2'
                      ></div>
                    </div>
                  </Fragment>
                ))}
              </section>

              <section
                id='dimension_inputs'
                className='gap-3 flex items-end mb-2 text-xs'
              >
                {dimensionsInformation.map((item) => (
                  <label>
                    {item.tag}
                    <div>
                      <TextInput
                        className='border-solid border-[1px] border-[#5E5E5E] bg-white '
                        variant='box'
                        id={item.name}
                        name={item.name}
                        type={'number'}
                        onClick={(e) =>
                          handleSendMessageToBrowserListener(
                            item.name,
                            'getInnerText'
                          )
                        }
                      />
                    </div>
                  </label>
                ))}

                <Select
                  label={selectDimensionUnit ?? 'Unit'}
                  className='text-xs border-solid border-[1px] border-[#5E5E5E] bg-white'
                  options={dimensionsUnitOptions}
                  onSelect={setSelectDimensionUnit}
                />
              </section>

              <section id='weight_input' className='w-1/2 mb-2'>
                <label>Weight</label>
                <div className='flex items-center mb-2'>
                  <TextInput
                    className='w-full border-solid border-[1px] border-[#5E5E5E] bg-white'
                    variant='box'
                    id='weight'
                    name='weight'
                    type='number'
                    onFocus={(e) =>
                      handleSendMessageToBrowserListener(
                        'weight',
                        'getInnerText'
                      )
                    }
                  />

                  <Select
                    label={selectWeightUnit ?? 'Unit'}
                    className='text-xs border-solid border-[1px] border-[#5E5E5E] bg-white'
                    options={weightOptions}
                    onSelect={setSelectWeightUnit}
                  />
                </div>
              </section>

              <section
                id='stock_information'
                className='gap-3 flex text-xs mb-2'
              >
                {stockInformation.map((item) => (
                  <label className=''>
                    {item.tag}
                    <TextInput
                      className='w-full ] mb-2 border-solid border-[1px] border-[#5E5E5E] bg-white'
                      variant='box'
                      id={item.name}
                      name={item.name}
                      type={'number'}
                      onFocus={(e) =>
                        handleSendMessageToBrowserListener(
                          item.name,
                          'getInnerText'
                        )
                      }
                    />
                  </label>
                ))}
              </section>

              <section id='category' className='flex gap-3 mt-3 mb-2'>
                <Select
                  label={selectCategory ?? 'Select A Category'}
                  className='text-xs w-72 border-solid border-[1px] border-[#5E5E5E] bg-white'
                  options={(categoryDetails ?? [])?.map((categoryDetail) =>
                    categoryDetail?.name?.toUpperCase()
                  )}
                  onSelect={setSelectCategory}
                />

                <Select
                  label={selectCurrency ?? 'Currency'}
                  className='text-xs border-solid border-[1px] border-[#5E5E5E] bg-white'
                  options={currencyOptions}
                  onSelect={setSelectCurrency}
                />
              </section>

              <section>
                <label>
                  Description
                  <div>
                    <textarea
                      className='w-full border-solid border-[1px] border-[#5E5E5E] bg-white'
                      rows={5}
                      cols={1}
                      id='description'
                      name='description'
                      required
                      onFocus={(e) =>
                        handleSendMessageToBrowserListener(
                          'description',
                          'getInnerText'
                        )
                      }
                      // className="w-full  border-[#5E5E5E] border mb-2"
                    ></textarea>
                  </div>
                </label>
              </section>
            </section>

            <div id='additional_information_header'>
              <hr
                style={{
                  margin: '1.5em 0 1.5em 0',
                  background: 'grey',
                  height: '2px',
                }}
              />
              <h2 className='font-bold text-lg my-3'>Additional Information</h2>
            </div>

            <section id='additional_information' className=''>
              {additionalInformation.map((item) => (
                <label className='additionalInfo'>
                  {item.tag}
                  <TextInput
                    className='w-full mb-2 border-solid border-[1px] border-[#5E5E5E] bg-white'
                    variant='box'
                    id={item.name}
                    name={item.name}
                    type={'text'}
                    onFocus={(e) =>
                      handleSendMessageToBrowserListener(
                        item.name,
                        'getInnerText'
                      )
                    }
                  />
                </label>
              ))}
            </section>
          </form>
          <div className='pt-3'>
            <Button
              className='w-full p-2 bg-[#101828]'
              variant={'filled'}
              onClick={handleSaveProduct}
            >
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductForm;
