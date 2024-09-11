import { useState, useEffect, useContext } from 'react';
import localForage from 'localforage';
import packageInfo from '../../../../package.json';
import readLocalResources from '@/components/Resources/useReadLocalResources';

import 'react-pdf/dist/Page/TextLayer.css';
import { Modal } from '@material-ui/core';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { selectOption } from './selectOptions';
import { Button } from '@mui/material';
import { Input } from '@mui/material';
import ExpandMore from '../../../../public/icons/expand_more.svg';
import { PdfPreview } from './pdfGenInterface/PdfPreview';
import { v4 as uuidv4 } from 'uuid';
import { ProjectContext } from '@/components/context/ProjectContext';
import { AutographaContext } from '@/components/context/AutographaContext';
import {
	TextOnlyTooltip,
	StyledSwitch,
} from './pdfGenInterface/pdfGenWrappers/fieldPicker/customMuiComponent';
import { WrapperTemplate } from './pdfGenInterface/pdfGenWrappers/WrapperTemplate';

export default function InnerFramePopup() {
	const {
		states: { listResourcesForPdf },
		actions: { setListResourcesForPdf },
	} = useContext(ProjectContext);

	const init = { bcvWrapper: ['bcvBible'], obsWrapper: ['obs'] };
	const initNames = { bcvWrapper: 'Book/Chapter/Verse', obsWrapper: 'OBS' };

	const jsonWithHeaderChoice = global.PdfGenStatic.pageInfo();
	//use to know if we can drag or not
	const [update, setUpdate] = useState(true);
	//the order Of The Selected choice
	const [orderSelection, setOrderSelection] = useState([0]);
	//is the json is validate or not
	const [isJsonValidate, setIsJsonValidate] = useState(false);
	const [messagePrint, setMessagePrint] = useState('');
	//the actual kitchenFaucet
	const pdfCallBacks = (json) => {
		setMessagePrint((prev) => prev + '\n' + messageToPeople(json));
	};
	const {
		states: { selectedProject },
	} = useContext(ProjectContext);

	const {
		states: { projects },
	} = useContext(AutographaContext);
	const [selected, setSelected] = useState(
		changeMetaDataToWrapperSection(selectedProject, projects),
	);

	//advenceMode allow adding new Wrapper
	const [advanceMode, setAdvenceMode] = useState(false);
	const [infoProject, setInfoProject] = useState(
		findProjectInfo(selectedProject, projects),
	);

	//the selected headerInfo
	const [headerInfo, setHeaderInfo] = useState('{"sizes":"9on11","fonts":"allGentium","pages":"EXECUTIVE"}');
	// const [headerInfo, setHeaderInfo] = useState('{}');
	const [nameFile, setNameFile] = useState('');
	const [folder, setFolder] = useState(null);
	//zoom of the preview
	const [kitchenFaucet, setKitchenFaucet] = useState('{}');
	const [openModalAddWrapper, setOpenModalAddWrapper] = useState(false);

	const handleOpenModalAddWrapper = (isOpen) => {
		setOpenModalAddWrapper(isOpen);
	};
	const handleChangeHeaderInfo = (type, value) => {
		let t = JSON.parse(headerInfo);
		t[type] = value;
		setHeaderInfo(JSON.stringify(t));
	};

	let sortableListClassName = 'sortable-TESTWRAPPER-list';
	let itemClassName = 'sortable-test1-item';

	//This useEffect Allow the user to drag end drop element in a list (here the wrapper themSelf)
	useEffect(() => {
		const sortableList = document.querySelector(
			`.${sortableListClassName}`,
		);
		const items = sortableList.querySelectorAll(`.${itemClassName}`);
		items.forEach((item) => {
			item.addEventListener('dragstart', () => {
				setTimeout(() => item.classList.add('dragging'), 0);
			});
			item.addEventListener('dragend', () => {
				item.classList.remove('dragging');
			});
		});
		const initSortableList = (e) => {
			if (update) {
				e.preventDefault();
				e.stopPropagation();
				const draggingItem = document.querySelector(
					`.${itemClassName}.dragging`,
				);
				if (!draggingItem) {
					return;
				}
				let siblings = [
					...sortableList.querySelectorAll(
						`.${itemClassName}:not(.dragging)`,
					),
				];

				let nextSibling = siblings.find((sibling) => {
					return (
						e.clientY <= sibling.offsetTop + sibling.offsetHeight
					);
				});

				sortableList.insertBefore(draggingItem, nextSibling);
			}
		};

		sortableList.addEventListener('dragover', initSortableList);
		sortableList.addEventListener('dragenter', (e) => e.preventDefault());
		return () => {
			sortableList.removeEventListener('dragover', initSortableList);
			items.forEach((item) => {
				item.removeEventListener('dragstart', () => {
					setTimeout(() => item.classList.add('dragging'), 0);
				});
			});
		};
	}, [update]);
	useEffect(() => {
		let pickerJson = Object.keys(listResourcesForPdf).reduce(
			(a, v) => ({ ...a, [v]: {} }),
			{},
		);
		localForage
			.getItem('userProfile')
			.then(async (user) => {
				const path = require('path');
				const newpath = localStorage.getItem('userPath');
				const currentUser = user?.username;
				const folderProject = path.join(
					newpath,
					packageInfo.name,
					'users',
					`${currentUser}`,
					'projects',
				);
				setInfoProject((prev) => {
					let p = { ...prev };
					p['path'] = path.join(
						newpath,
						packageInfo.name,
						'users',
						`${currentUser}`,
						'projects',
						`${p.name}_${p.id[0]}/ingredients`,
					);
					return p;
				});
				const folderRessources = path.join(
					newpath,
					packageInfo.name,
					'users',
					`${currentUser}`,
					'resources',
				);
				createSection(folderProject, pickerJson);
				createSection(folderRessources, pickerJson);
				return currentUser;
			})
			.then((currentUser) => {
				setListResourcesForPdf(pickerJson);
				return currentUser;
			})
			.then((currentUser) => readLocalResources(currentUser, () => {}));
	}, []);

	useEffect(() => {
		setKitchenFaucet(
			JSON.stringify(
				transformPrintDataToKitchenFaucet({
					order: orderSelection,
					metaData: JSON.parse(headerInfo),
					content: selected,
				}),
			),
		);
	}, [selected, headerInfo, orderSelection]);

	useEffect(() => {
		let validationJson = global.PdfGenStatic.validateConfig(JSON.parse(kitchenFaucet));
		if (validationJson.length === 0) {
			let header = JSON.parse(headerInfo);
			// console.log('header ==',header);
			if (
				header.workingDir &&
				header.outputPath &&
				header.sizes &&
				header.fonts &&
				header.pages
			)
				setIsJsonValidate(true);
		} else {
			setIsJsonValidate(false);
		}
		// console.log("kitchenFaucet==",kitchenFaucet);
	}, [kitchenFaucet, headerInfo]);

	const openFileDialogSettingData = async () => {
		try {
			const options = {
				properties: ['openDirectory'],
			};
			const { dialog } = window.require('@electron/remote');
			const chosenFolder = await dialog.showOpenDialog(options);
			if (chosenFolder.canceled) {
				// Handle dialog cancel case
				console.log('Dialog was canceled');
				return;
			}
			if (chosenFolder.filePaths.length > 0) {
				setFolder(chosenFolder.filePaths[0]);
			} else {
				// Handle case where no folder was selected
				console.log('No folder was selected');
			}
		} catch (error) {
			console.error('Error opening file dialog:', error);
		}
	};

	useEffect(() => {
		if (folder && nameFile !== '') {
			setHeaderInfo((prev) => {
				let t = { ...JSON.parse(prev) };
				t['outputPath'] = folder + '/' + nameFile + '.pdf';
				t['verbose'] = false;
				return JSON.stringify(t);
			});
		}
	}, [nameFile, folder]);

	useEffect(() => {
		const fs = window.require('fs');
		const os = window.require('os');
		const path = window.require('path');

		// Get the temporary directory of the system
		const tmpDir = os.tmpdir();
		fs.mkdtemp(`${tmpDir}${path.sep}`, (err, folder) => {
			if (err) {
				console.log(err);
			} else {
				setHeaderInfo((prev) => {
					let t = { ...JSON.parse(prev) };
					t['workingDir'] = folder;
					return JSON.stringify(t);
				});
			}
		});
	}, []);

	const handleInputChange = (e) => {
		const value = e.target.value;
		const regex = /^[a-zA-Z_]*$/; // Regular expression to allow only letters and underscores

		if (regex.test(value)) {
			setNameFile(value); // Update state only if the input matches the regex
		}
	};

	return (
		<div
			style={{
				display: 'flex',
				height: '100%',
				backgroundColor: '#FFFFFF',
				width: '100%',
				borderBottomWidth: 2,
				borderStyle: 'solid',
				borderColor: '#EEEEEE',
			}}>
			<div
				style={{
					width: '60%',
					borderLeft: '2px solid gray',
					overflowY: 'scroll',
					padding: 20,
				}}>
				<div
					style={{
						padding: 20,
						borderBottomWidth: 1,
						borderStyle: 'solid',
						borderColor: '#575757',
					}}>
					{selectOption(
						'fonts',
						'fonts',
						jsonWithHeaderChoice.fonts,
						handleChangeHeaderInfo,
					)}
					{selectOption(
						'Pages',
						'pages',
						jsonWithHeaderChoice.pages,
						handleChangeHeaderInfo,
					)}
					{selectOption(
						'Sizes',
						'sizes',
						jsonWithHeaderChoice.sizes,
						handleChangeHeaderInfo,
					)}
				</div>
				<div style={{ padding: 5 }}>
					<div
						style={{
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'space-between',
						}}>
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								gap: 8,
							}}>
							<div
								style={{
									fontWeight: 'regular',
									display: 'flex',
									fontSize: 18,
									color: 'Black',
									justifyContent: 'left',
								}}>
								Content
							</div>
							<div
								style={{
									backgroundColor: '#464646',
									borderRadius: 25,
									justifyContent: 'center',
									color: 'white',
									alignContent: 'center',
									justifyItems: 'center',
									textAlign: 'center',
									alignItems: 'center',
									paddingTop: 5,
									paddingBottom: 5,
									paddingLeft: 11,
									paddingRight: 11,
								}}
								onClick={() => {}}>
								Reset parameters
							</div>
						</div>
						<TextOnlyTooltip
							placement='top-end'
							title={
								<div>
									<div
										style={{
											fontSize: 14,
											fontStyle: 'normal',
											fontWeight: 600,
										}}>
										Advanced
									</div>
									<div
										style={{
											fontSize: 14,
											fontStyle: 'normal',
											fontWeight: 400,
										}}>
										mode Merge projects into a single
										export, access more print types, and use
										loop mode.
									</div>
								</div>
							}
							arrow>
							<div
								style={{
									display: 'flex',
									flexDirection: 'column',
									gap: 8,
								}}>
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										color: 'black',
										fontFamily: 'Lato',
										fontWeight: 400,
										fontSize: 20,
									}}>
									Advanced mode
								</div>
								<div
									style={{
										display: 'flex',
										flexDirection: 'row',
									}}>
									<StyledSwitch
										onChange={() =>
											setAdvenceMode((prev) => !prev)
										}
									/>
									<div
										style={{
											alignSelf: 'center',
											display: 'flex',
											alignItems: 'center',
											color: 'black',
											fontFamily: 'Lato',
											fontWeight: 400,
											fontSize: 20,
										}}>
										{advanceMode ? 'On' : 'Off'}
									</div>
								</div>
							</div>
						</TextOnlyTooltip>
					</div>
					<ul className={'sortable-TESTWRAPPER-list'}>
						{Object.keys(selected).map((k, index) => {
							return (
								<li
									id={k}
									className={'sortable-test1-item'}
									draggable='true'
									key={k}
									style={{ margin: 10 }}>
									<WrapperTemplate
										setFinalPrint={setSelected}
										projectInfo={infoProject}
										wrapperType={selected[k].type}
										keyWrapper={k}
										setUpdate={setUpdate}
										advanceMode={advanceMode}
										changePrintData={setSelected}
										changePrintOrder={setOrderSelection}
									/>
								</li>
							);
						})}
					</ul>
					{advanceMode ? (
						<div
							style={{
								borderRadius: 6,
								borderWidth: 1,
								borderStyle: 'solid',
								borderCollor: '#EEEEEE',
								display: 'flex',
								padding: 1,
								flexDirection: 'column',
								alignItems: 'flexStart',
								alignSelf: 'stretch',
								backgroundColor: '#FCFAFA',
								padding: 12,
								margin: 12,
							}}>
							<div
								style={{
									display: 'flex',
									width: 80,
									height: 28,
									paddingLeft: 12,
									borderRadius: 4,
									paddingRight: 6,
									justifyContent: 'space-between',
									alignItems: 'center',
									backgroundColor: '#F50',
									color: 'white',
								}}
								onClick={() => handleOpenModalAddWrapper(true)}>
								Add
								<ExpandMore />
							</div>
						</div>
					) : (
						<></>
					)}

					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							padding: 15,
							gap: 12,
						}}>
						<Button
							style={{
								borderRadius: 4,
								backgroundColor: '#F50',
								borderStyle: 'solid',
								borderColor: '#F50',
								color: 'white',
								margin: 'auto',
								padding: 15,
							}}
							onClick={() => {
								openFileDialogSettingData();
							}}>
							Choose export folder
						</Button>
						<Input
							onChange={(e) => {
								handleInputChange(e);
							}}
							value={nameFile}
							placeholder={'your file name here'}
						/>
						<Button
							style={
								isJsonValidate
									? {
											borderRadius: 4,
											backgroundColor: '#F50',
											borderStyle: 'solid',
											margin: 'auto',

											borderColor: '#F50',
											color: 'white',
											padding: 15,
									  }
									: {
											borderRadius: 4,
											backgroundColor: 'grey',
											borderStyle: 'solid',
											borderColor: '#F50',
											margin: 'auto',

											color: 'white',
											padding: 15,
									  }
							}
							onClick={async () => {
								if (isJsonValidate) {
									setMessagePrint('');
									let t = new global.PdfGenStatic(
										JSON.parse(kitchenFaucet),
										pdfCallBacks,
									);

									const path = t.options.global.workingDir;
									setMessagePrint(
										(prev) =>
											prev + '\n' + 'working in ' + path,
									);

									try {
										await t.doPdf(); // Ensure doPdf is awaited since it's async
									} catch (pdfError) {
										setMessagePrint(
											'PDF generation failed: ' +
												pdfError.message,
										);
									}
								}
							}}>
							print
						</Button>
					</div>
				</div>
				<Modal
					open={openModalAddWrapper}
					onClose={() => handleOpenModalAddWrapper(false)}
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						flexDirection: 'row',
					}}>
					<div
						style={{
							backgroundColor: 'white',
							width: '50%',
							borderRadius: 10,
						}}>
						<div>
							{Object.keys(init).map((c, id) => (
								<div
									className='pdfChoice'
									onClick={() => {
										let i = Math.max(orderSelection) + 1;
										setSelected((prev) => {
											let t = { ...prev };
											t[i] = { type: c, content: {} };
											return t;
										});
										setOrderSelection((prev) => [
											...prev,
											i,
										]);
										handleOpenModalAddWrapper(false);
									}}>
									{initNames[c]}
								</div>
							))}
						</div>
					</div>
				</Modal>
			</div>
			<div
				style={{
					width: '40%',
					height: '100%',
					whiteSpace: 'pre-wrap',
					overflow: 'scroll',
					padding: 12,
				}}>
				{messagePrint}
			</div>
		</div>
	);
}

function transformPrintDataToKitchenFaucet(jsonData) {
	// console.log("jsonData ==", jsonData)
	let kitchenFaucet = [];
	if (jsonData.content) {
		for (let i = 0; i < jsonData.order.length; i++) {
			let currentWrapper = jsonData.content[jsonData.order[i]];

			let elem = { ...currentWrapper };
			if (!elem.ranges) {
				if (elem.type === 'obsWrapper') {
					elem.ranges = ['1-50'];
				}
			}
			delete elem['content'];
			elem.sections = [];
			if (currentWrapper.content.order) {
				for (let t = 0; t < currentWrapper.content.order.length; t++) {
					let section = {
						...currentWrapper.content.content[
							currentWrapper.content.order[t]
						],
					};
					let source = section.source;
					delete section.source;
					if (section.type === 'bookNote') {
						section.notes = source;
					} else if (
						section.type === 'bcvBible' ||
						section.type === 'paraBible'
					) {
						section.content.scriptureSrc = source;
					} else if (section.type === 'obs') {
						section.content.obs = source;
					}

					elem.sections.push(section);
				}
			}

			kitchenFaucet.push(elem);
		}
	}
	return { global: jsonData.metaData, sections: kitchenFaucet };
}

function messageToPeople(json) {
	let message = '';
	for (let i = 0; i < json.level; i++) {
		message += '\t';
	}
	if (json.type === 'step') {
		message += 'Starting step ' + json.args[0];
	} else if (json.type === 'section') {
		message += 'Starting to prepare ' + json.args[0];
	} else if (json.type === 'wrappedSection') {
		message +=
			'Preparing section of type ' +
			json.args[0] +
			' from ' +
			json.args[1].split('-')[0];
		if (json.args[1].split('-')[1]) {
			message += ' to ' + json.args[1].split('-')[1];
		}
	} else if (json.type === 'pdf') {
		message += 'Writing pdf of ' + json.args[1];
	} else {
		findProjectInfo();
		message += json.msg;
	}
	return message;
}

export function findProjectInfo(meta, autoGrapha) {
	return autoGrapha?.filter((a) => a.name + '_' + a.id === meta)[0];
}

function changeMetaDataToWrapperSection(meta, autoGrapha) {

	let t = findProjectInfo(meta, autoGrapha);
	if (t.type === 'Text Translation') {
		return {
			0: {
				type: 'bcvWrapper',
				id: uuidv4(),
				content: {
					content: { 0: { type: 'null', content: {} } },
					order: [0],
				},
			},
		};
	} else if (t.type === 'OBS') {
		return {
			0: {
				type: 'obsWrapper',
				id: uuidv4(),
				content: {
					content: { 0: { type: 'null', content: {} } },
					order: [0],
				},
			},
		};
	} else if (t.type === "Juxtalinear"){
		return {
			0: {
				type: 'bcvWrapper',
				id: uuidv4(),
				content: {
					content: { 0: { type: 'null', content: {} } },
					order: [0],
				},
			},
		};
	}
}

function createSection(folder, pickerJson) {
	const path = require('path');
	const newpath = localStorage.getItem('userPath');
	const fs = window.require('fs');

	const projects = fs.readdirSync(folder);

	let currentMetadataPath = '';
	for (let project of projects) {
		currentMetadataPath = path.join(folder, '/', project, '/', 'metadata.json');
		if (fs.existsSync(currentMetadataPath)) {
			let jsontest = fs.readFileSync(currentMetadataPath, 'utf-8');
			let jsonParse = JSON.parse(jsontest);
			let projectS, jsonParseIngre;

			if (jsonParse.identification?.name.en) {
				jsonParseIngre = jsonParse.ingredients;
				projectS = '[' + jsonParse.identification.name.en + ']';
			} else {
				jsonParseIngre = jsonParse.meta.ingredients;
				projectS = '[' + jsonParse.meta.full_name + ']';
			}

			let fileName;
			if (jsonParse?.type?.flavorType?.flavor?.name === 'textTranslation') {
				if (jsonParse.resourceMeta) {
					pickerJson.book[jsonParse.resourceMeta?.full_name] = {
						description: `${jsonParse.resourceMeta?.full_name}`,
						language: `${jsonParse.resourceMeta?.language}`,
						src: {
							type: 'fs',
							path: folder.includes('projects')
								? `${folder}/${project}/ingredients`
								: `${folder}/${project}`,
						},
						books: [],
					};
				} else if (jsonParse.identification) {
					pickerJson.book[jsonParse.identification.name[jsonParse.languages[0].tag]] = {
						description: `${jsonParse.identification.name[jsonParse.languages[0].tag]}`,
						language: `${jsonParse.languages[0].tag}`,
						src: {
							type: 'fs',
							path: folder.includes('projects')
								? `${folder}/${project}/ingredients`
								: `${folder}/${project}`,
						},
						books: [],
					};
				}
			} else if (jsonParse?.type?.flavorType?.flavor?.name === 'textStories') {
				fileName = 'content';
				pickerJson.OBS[`OBS ${jsonParse.resourceMeta?.full_name}`] = {
					description: `OBS ${jsonParse.resourceMeta?.full_name}`,
					language: jsonParse.meta.defaultLocale,
					src: {
						type: 'fs',
						path: folder.includes('projects')
							? `${folder}/${project}/ingredients`
							: `${folder}/${project}/${fileName}`,
					},
					books: [],
				};
			} else if (jsonParse?.meta?.repo?.flavor_type === 'parascriptural') {
				fileName = 'content';
				pickerJson.tNotes[`tNotes ${jsonParse.meta.repo.full_name}`] = {
					description: `tNotes ${jsonParse.meta.repo.full_name}`,
					language: jsonParse.meta.defaultLocale,
					src: {
						type: 'fs',
						path: folder.includes('projects')
							? `${folder}/${project}/ingredients`
							: `${folder}/${project}`,
					},
					books: [],
				};
			} else if (jsonParse?.type?.flavorType?.flavor?.name === 'x-juxtalinear') {
				fileName = 'content';
				pickerJson.jxl[Object.values(jsonParse.identification.name)[0]] = {
					description: `${Object.values(jsonParse.identification.name)[0]}`,
					language: jsonParse.languages[0] ? jsonParse.languages[0].name.en : "French",
					src: {
						type: 'fs',
						path: folder.includes('projects')
							? `${folder}/${project}/ingredients`
							: `${folder}/${project}`,
					},
					books: jsonParse.type.flavorType.currentScope ? Object.keys(jsonParse.type.flavorType.currentScope) : [],
				};
			}
		}
	}
}
