/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { SnackBar } from '@/components/SnackBar';
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/20/solid';

export default function ChecksContent({ content }) {
	const [openSnackBar, setOpenSnackBar] = useState(false);
	const [snackText, setSnackText] = useState('');
	const [groupedData, setGroupedData] = useState({});
	const [error, setError] = useState('');

	const isArray = Array.isArray(content);
	console.log("loaded checks", JSON.stringify(content, null, 4));

	useEffect(() => {
		console.log("isArray", isArray)
		if (isArray) {
			let tmpGroupedData = {};
			let currentName = "";
			for (let check of content) {
				currentName = check.name;
				if (!tmpGroupedData[currentName]) {
					tmpGroupedData[currentName] = [];
				}
				delete check.name;
				tmpGroupedData[currentName].push(check);
			}
			setGroupedData(tmpGroupedData);
		}
	}, [content]);

	useEffect(() => {
		console.log("groupedData ==", groupedData);
	}, [groupedData]);

	return (
		<div className='container mx-auto'>
			<div className='bg-primary flex justify-between items-center p-4 rounded-lg'>
				<h2 className='text-white font-bold text-lg'>Checks</h2>
			</div>
			<div className='bg-gray-50 p-6 rounded-lg max-h-[75vh] overflow-y-auto'>
				{Object.keys(groupedData).length > 0 ? (
					Object.keys(groupedData).map((key) => (
						<Disclosure key={key}>
							{({ open }) => (
								<>
									<Disclosure.Button className='flex justify-between w-full px-4 py-2 text-sm font-medium text-left text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75'>
										<span>{key}</span>
										<ChevronUpIcon
											className={`${open ? '' : 'transform rotate-180'} w-5 h-5 text-gray-500`}
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
			<SnackBar
				openSnackBar={openSnackBar}
				setOpenSnackBar={setOpenSnackBar}
				snackText={snackText}
				setSnackText={setSnackText}
				error={error}
			/>
		</div>
	);
}
