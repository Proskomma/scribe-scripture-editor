/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState, useContext, Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { Dialog, Transition } from '@headlessui/react';
import { SnackBar } from '@/components/SnackBar';
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/20/solid';
import { randomUUID } from 'crypto';
// import * as logger from '../../logger';

export default function ChecksPopup({
	openChecksPopup,
	setOpenChecksPopup,
	content
}) {
	const cancelButtonRef = useRef(null);
	// const [groupedData, setGroupedData] = useRef({});
	const [openSnackBar, setOpenSnackBar] = useState(false);
	const [snackText, setSnackText] = useState('');
	const [groupedData, setGroupedData] = useState({});
	const [error, setError] = useState('');

	const removeSection = () => {
		setOpenChecksPopup(false);
	};

	const isArray = Array.isArray(content);


	useEffect(() => {
		if (isArray) {
			let tmpGroupedData = {};
			let currentName = "";
			for (let check of content) {
				// console.log("check==", check);
				currentName = check.name;
				if (!tmpGroupedData[currentName]) {
					tmpGroupedData[currentName] = [];
				}
				delete check.name;
				tmpGroupedData[currentName].push(check);
			}
			console.log("tmpGroupedData ==", tmpGroupedData)
			setGroupedData(tmpGroupedData);
		}
	}, [content]);

	useEffect(() => {
		console.log("groupedData ==", groupedData)
	}, [groupedData]);

	// const groupedData = () => {
	// 	let group = {};
	// 	if (isArray) {
	// 		content.forEach(test => {
	// 			test.issues.reduce((acc, curr) => {
	// 				if (!acc[curr.name]) {
	// 					acc[curr.name] = [];
	// 				}
	// 				acc[curr.name].push(curr);

	// 				return acc;
	// 			}, {});
	// 		});
	// 		console.log("content ==", content);
	// 	} else {
	// 		return [];
	// 	}
	// }

	return (
		<>
			<Transition
				show={openChecksPopup}
				as={Fragment}
				enter='transition duration-100 ease-out'
				enterFrom='transform scale-95 opacity-0'
				enterTo='transform scale-100 opacity-100'
				leave='transition duration-75 ease-out'
				leaveFrom='transform scale-100 opacity-100'
				leaveTo='transform scale-95 opacity-0'>
				<Dialog
					as='div'
					className='fixed inset-0 z-10 overflow-y-auto'
					initialFocus={cancelButtonRef}
					static
					open={openChecksPopup}
					onClose={removeSection}>
					<Dialog.Overlay className='fixed inset-0 bg-black opacity-50' />
					<div className='flex items-center justify-center min-h-screen'>
						<div className='relative bg-white rounded-lg shadow-xl w-full max-w-3xl mx-auto my-8 p-4'>
							<div className='bg-primary flex justify-between items-center rounded-t-lg p-4'>
								<h1 className='text-white font-bold text-lg'>Checks</h1>
								<button
									type='button'
									className='text-white'
									onClick={removeSection}>
									<XMarkIcon className='h-6 w-6' />
								</button>
							</div>
							<div className='bg-gray-50 p-6 rounded-b-lg max-h-[75vh] overflow-y-auto'>
								{Object.keys(groupedData).length > 0 ? (
									Object.keys(groupedData).map((key) => (
										<Disclosure key={key}>
											{({ open }) => (
												<>
													<Disclosure.Button className='flex justify-between w-full px-4 py-2 text-sm font-medium text-left text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75'>
														<span>{key}</span>
														<ChevronUpIcon
															className={`${open ? '' : 'transform rotate-180'
																} w-5 h-5 text-gray-500`}
														/>
													</Disclosure.Button>
													<Disclosure.Panel className='px-4 pt-4 pb-2 text-sm text-gray-700'>
														<ul className='space-y-2'>
															{groupedData[key].map((item, index) => (
																<li key={index} className='border p-2 rounded bg-white shadow-sm'>
																	{item.args.cv}
																</li>
															))}
														</ul>
													</Disclosure.Panel>
												</>
											)}
										</Disclosure>
									))
								) : (
									<p className='text-center text-gray-500'>No content available.</p>
								)}
							</div>
						</div>
					</div>
				</Dialog>
			</Transition>
			<SnackBar
				openSnackBar={openSnackBar}
				setOpenSnackBar={setOpenSnackBar}
				snackText={snackText}
				setSnackText={setSnackText}
				error={error}
			/>
		</>
	);
}
